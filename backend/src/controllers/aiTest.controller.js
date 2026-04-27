const AiTest = require("../models/aiTest.model");
const Resume = require("../models/resume.model");

const { generateQuestions } = require("../services/aiQuestion.service");
const { evaluateAnswer } = require("../services/aiEvaluation.service");
const { generateMCQSummary } = require("../services/aiSummary.service");

// 🔥 role detection
const detectRole = (data) => {
  const skills = data.skills.join(" ").toLowerCase();

  if (skills.includes("react")) return "frontend";
  if (skills.includes("node")) return "backend";

  return "fullstack";
};

// ================= START =================
const startTest = async (req, res) => {
  try {
    const { type } = req.body;

    const resume = await Resume.findOne({ userId: req.user.id });

    if (!resume) {
      return res.status(400).json({
        message: "Upload resume first",
      });
    }

    const role = detectRole(resume.structuredData);

    const questions = await generateQuestions(
      resume.structuredData,
      type,
      role,
    );

    const aiTest = await AiTest.create({
      userId: req.user.id,
      type,
      role,
      questions,
    });

    return res.json({
      interviewId: aiTest._id,
      questions: questions.map((q) => ({
        question: q.question,
        options: q.options || [],
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Error starting interview" });
  }
};

// ================= ANSWER =================
const submitTestAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    const aiTest = await AiTest.findById(id);

    if (!aiTest) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    // 🔥 ADD THIS BLOCK
    if (aiTest.status === "completed") {
      return res.status(400).json({
        message: "This interview is already completed",
        completed: true,
        totalScore: aiTest.totalScore,
        summary: aiTest.summary || null,
      });
    }

    const index = aiTest.currentQuestionIndex;
    const q = aiTest.questions[index];

    let result;

    // 🔥 MCQ → local check
    if (aiTest.type === "mcq") {
      const isCorrect = answer === q.correctAnswer;

      result = {
        score: isCorrect ? 10 : 0,
        feedback: isCorrect ? "Correct" : "Incorrect",
      };
    }

    // 🔥 LONG → AI
    else {
      result = await evaluateAnswer(q.question, answer);
    }

    // save
    q.userAnswer = answer;
    q.aiFeedback = result.feedback;
    q.score = result.score;

    aiTest.totalScore += result.score;
    aiTest.currentQuestionIndex++;

    // 🔥 completed
    if (aiTest.currentQuestionIndex >= aiTest.questions.length) {
      aiTest.status = "completed";

      const summary = await generateMCQSummary(aiTest.questions);
      aiTest.summary = summary;
    }

    await aiTest.save();

    if (aiTest.status === "completed") {
      return res.json({
        completed: true,
        totalScore: aiTest.totalScore,
        summary: aiTest.summary || null,
      });
    }

    // continue interview
    return res.json({
      completed: false,
      feedback: result.feedback,
      score: result.score,
      nextQuestion: {
        question: aiTest.questions[aiTest.currentQuestionIndex].question,
        options:
          aiTest.questions[aiTest.currentQuestionIndex].options || [],
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
};

const getTestById = async (req, res) => {
  const test = await AiTest.findById(req.params.id);
  res.json({ data: { aiTest: test } });
};



// ================= Test History ==================

const getTestHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const aiTest = await AiTest.find({ userId })
      .select("type role totalScore status summary createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      count: aiTest.length,
      data: aiTest,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error fetching history",
    });
  }
};



// ================= Test Analysis ==================

const getTestAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const aiTests = await AiTest.find({
      userId,
      status: "completed",
    }).lean();

    if (aiTests.length === 0) {
      return res.json({
        totalInterviews: 0,
      });
    }

    let totalScore = 0;
    let totalQuestions = 0;

    let mcqStats = {
      total: 0,
      attempted: 0,
      correct: 0,
      wrong: 0,
      scores: [],
    };

    let longStats = {
      total: 0,
      scores: [],
    };

    for (let aiTest of aiTests) {
      totalScore += aiTest.totalScore || 0;

      for (let q of aiTest.questions) {
        totalQuestions++;

        if (aiTest.type === "mcq") {
          mcqStats.total++;

          if (q.userAnswer) {
            mcqStats.attempted++;

            if (q.userAnswer === q.correctAnswer) {
              mcqStats.correct++;
            } else {
              mcqStats.wrong++;
            }
          }

          if (q.score !== undefined) {
            mcqStats.scores.push(q.score);
          }
        }

        if (aiTest.type === "long") {
          longStats.total++;

          if (q.score !== undefined) {
            longStats.scores.push(q.score);
          }
        }
      }
    }

    // 🔥 calculations
    const avg = (arr) =>
      arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

    const mcqAvg = avg(mcqStats.scores);
    const longAvg = avg(longStats.scores);

    const accuracy =
      mcqStats.attempted > 0
        ? Math.round((mcqStats.correct / mcqStats.attempted) * 100)
        : 0;

    // 🔥 weak/strong detection
    let strongArea = "Balanced";
    let weakArea = "None";

    if (mcqAvg > longAvg) {
      strongArea = "MCQ";
      weakArea = "Long Answer";
    } else if (longAvg > mcqAvg) {
      strongArea = "Long Answer";
      weakArea = "MCQ";
    }

    return res.json({
      totalInterviews: aiTests.length,

      overallAvgScore: Math.round(totalScore / aiTests.length),

      mcq: {
        totalQuestions: mcqStats.total,
        attempted: mcqStats.attempted,
        correct: mcqStats.correct,
        wrong: mcqStats.wrong,
        accuracy: accuracy,
        averageScore: mcqAvg,
      },

      long: {
        totalQuestions: longStats.total,
        averageScore: longAvg,
        bestScore: longStats.scores.length ? Math.max(...longStats.scores) : 0,
        lowestScore: longStats.scores.length
          ? Math.min(...longStats.scores)
          : 0,
      },

      insights: {
        strongArea,
        weakArea,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error fetching analytics",
    });
  }
};

module.exports = {
  startTest,
  submitTestAnswer,
  getTestHistory,
  getTestAnalytics,
  getTestById,
};

const LiveInterview = require("../models/liveInterview.model");
const Resume = require("../models/resume.model");
    const User = require("../models/user.model");
const getGroq = require("../config/groq");
const { generateLiveSummary } = require("../services/liveSummary.service");

// 🔥 role detection
const detectRole = (data) => {
  if (!data) return "fullstack";

  // safe extraction
  const skills = Array.isArray(data.skills)
    ? data.skills.join(" ").toLowerCase()
    : "";

  const projects = Array.isArray(data.projects)
    ? JSON.stringify(data.projects).toLowerCase()
    : "";

  const combined = skills + " " + projects;

  if (combined.includes("react")) return "frontend";
  if (combined.includes("node")) return "backend";

  return "fullstack";
};

// ================= START =================
const startLiveInterview = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id }).sort({
      createdAt: -1,
    });


    if (!resume) {
      return res.status(400).json({
        message: "Upload resume first",
      });
    }

    if (!resume.structuredData) {
      return res.status(400).json({
        message: "Resume not processed properly",
      });
    }

    const user = await User.findById(req.user.id).select("name");
    const userName = user?.name || "there";

    const role = detectRole(resume.structuredData);

    const prompt = `
You are a senior software engineer conducting a real technical interview.

CANDIDATE:
Name: ${userName}
Role: ${role}

RESUME DATA (STRICT — DO NOT INVENT ANYTHING):
${JSON.stringify(resume.structuredData)}

OBJECTIVE:
Start a natural, human-like interview conversation.

FLOW:
- Greet the candidate by name
- Introduce yourself briefly (e.g., "I'm John")
- Keep it warm and simple
- Ask the candidate to introduce themselves

STYLE:
- Very conversational
- Short and natural (1–2 lines max)
- Like a real human, not formal

IMPORTANT RULES:
- Do NOT mention multiple skills/projects
- Do NOT summarize the resume
- Do NOT ask technical questions yet
- Do NOT assume anything not in resume

ANTI-HALLUCINATION:
- ONLY use Resume Data if clearly needed
- If unsure → do NOT reference anything

GOOD EXAMPLES:
"Hi Amit, I’m John—nice to meet you. Can you tell me a bit about yourself?"

"Hey Amit, I’m John. Great to meet you—could you walk me through your background?"

BAD EXAMPLES:
❌ Long paragraphs
❌ Listing projects/skills
❌ Jumping into technical questions

OUTPUT:
Only the message text (1–2 lines max).
`;

    const groqClient = getGroq();
    const response = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a professional interviewer." },
        { role: "user", content: prompt },
      ],
    });

    const firstQuestion = response.choices[0].message.content;

    const interview = await LiveInterview.create({
      userId: req.user.id,
      role,
      messages: [{ role: "ai", content: firstQuestion }],
    });

    return res.json({
      data: {
        interviewId: interview._id,
        message: firstQuestion,
      },
    });
  } catch (err) {
    console.error("START INTERVIEW ERROR:", err);
    res.status(500).json({ message: "Error starting interview" });
  }
};

// ================= CHAT =================
const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const resume = await Resume.findOne({ userId: req.user.id });
    if (!resume) {
      return res.status(400).json({
        message: "Upload resume first",
      });
    }

    const user = await User.findById(req.user.id).select("name");
    const userName = user?.name || "there";

    const interview = await LiveInterview.findById(id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.status === "completed") {
      return res.json({
        message: "Interview already completed",
        summary: interview.summary,
      });
    }

    // save user message
    interview.messages.push({
      role: "user",
      content: message,
    });

    const chatHistory = interview.messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

   const prompt = `
You are a senior software engineer conducting a real technical interview.

OBJECTIVE:
Simulate a realistic, human-like, and adaptive interview conversation.

CANDIDATE:
Name: ${userName}
Role: ${interview.role}

RESUME DATA (STRICT CONTEXT — DO NOT INVENT):
${JSON.stringify(resume.structuredData)}

CONVERSATION:
${chatHistory}

CORE RULES:

1. KEEP RESPONSES SHORT:
- Max 2–3 lines total
- No long explanations

2. RESPONSE STRUCTURE:
- 1 short feedback line (if needed)
- 1 clear question

3. EVALUATE LAST ANSWER:

- STRONG:
  → brief appreciation (vary wording)
  → go deeper OR switch topic

- PARTIAL:
  → acknowledge correct part
  → ask ONE focused follow-up

- WEAK:
  → point out gap briefly
  → simplify or switch topic

4. FOLLOW-UP CONTROL:
- Only ask follow-up if meaningful
- Otherwise move to a new topic naturally

5. TOPIC STRATEGY:
- Gradually explore:
  • projects
  • fundamentals
  • real-world scenarios
- Avoid repeating same type of question

6. ANTI-REPETITION:
- Do NOT repeat phrases like:
  ❌ "Good answer"
  ❌ "Nice approach"
- Vary tone naturally

7. ANTI-HALLUCINATION:
- ONLY use Resume Data + Conversation
- DO NOT assume missing details
- If unsure → ASK instead of assuming

8. HUMAN STYLE:
- Natural, confident, slightly strict
- No robotic tone

GOOD EXAMPLES:

"That’s a solid approach. How would this scale under heavy load?"

"Partially correct—you missed failure handling. How would you handle retries?"

"Alright, let’s switch gears—can you explain your backend architecture?"

BAD EXAMPLES:
❌ Long paragraphs
❌ Multiple questions
❌ Resume summaries

OUTPUT:
- Max 2–3 lines
- Exactly ONE question
`;

    const groqClient = getGroq();
    const response = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      messages: [
        { role: "system", content: "You are a strict interviewer." },
        { role: "user", content: prompt },
      ],
    });

    const aiReply = response.choices[0].message.content;

    interview.messages.push({
      role: "ai",
      content: aiReply,
    });

    await interview.save();

    return res.json({
      reply: aiReply,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending message" });
  }
};

// ================= END =================
const endInterview = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await LiveInterview.findById(id);

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    if (interview.status === "completed") {
      return res.json({
        message: "Already completed",
        summary: interview.summary,
      });
    }

    const summary = await generateLiveSummary(interview.messages);

    interview.summary = summary;
    interview.status = "completed";

    await interview.save();

    return res.json({
      message: "Interview completed",
      summary,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error ending interview",
    });
  }
};


const getLiveInterviewById = async (req, res) => {
  try {
    const interview = await LiveInterview.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    return res.json({
      data: interview,
    });
  } catch (err) {
    console.error("GET LIVE INTERVIEW ERROR:", err);
    res.status(500).json({ message: "Error fetching interview" });
  }
};

const getInterviewHistory = async (req, res) => {
  try {
    const interviews = await LiveInterview.find({ userId: req.user.id })
      .select("role status createdAt summary")
      .sort({ createdAt: -1 });

    res.json({ data: interviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching interview history" });
  }
};

module.exports = {
  startLiveInterview,
  sendMessage,
  endInterview,
  getInterviewHistory,
  getLiveInterviewById,
};

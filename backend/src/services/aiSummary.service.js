const getGroq = require("../config/groq");

function groq() { return getGroq(); }

const extractJSON = (text) => {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
};

const generateMCQSummary = async (questions) => {
  try {
    const formatted = questions
      .map(
        (q, i) => `
Q${i + 1}: ${q.question}
User Answer: ${q.userAnswer}
Correct Answer: ${q.correctAnswer}
Score: ${q.score}
`,
      )
      .join("\n");

    const prompt = `
You are a senior interviewer analyzing a candidate’s test performance.

Analyze the following MCQ results:

${formatted}

GOAL:
- Identify strengths
- Identify weak areas
- Provide actionable advice

RETURN STRICT JSON:

{
  "strengths": "what candidate is good at",
  "weaknesses": "what needs improvement",
  "overallFeedback": "final professional feedback"
}

IMPORTANT:
- Be specific
- Avoid generic statements
- Output valid JSON only
`;

  const client = groq();
  const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: "You are a strict evaluator. Return only JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const parsed = extractJSON(response.choices[0].message.content);

    return parsed || {};
  } catch (err) {
    console.error("Summary Error:", err);
    return {};
  }
};

module.exports = { generateMCQSummary };

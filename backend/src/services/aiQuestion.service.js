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

const generateQuestions = async (structuredData, type, role) => {
  try {
    const skills = structuredData.skills?.join(", ") || "";
    const projects =
      structuredData.projects
        ?.map((p) => `${p.name}: ${p.description}`)
        .join("\n") || "";

    const prompt = `
You are a senior software engineer and technical interviewer at a top tech company.

Your task is to design a high-quality technical interview.

CANDIDATE PROFILE:
Role: ${role}
Skills: ${skills}

Projects:
${projects}

GOAL:
- Assess real-world ability, not memorization
- Focus on applied knowledge, debugging, system thinking
- Prioritize questions derived from candidate projects

STRICT RULES:
- No generic textbook questions
- No definitions like "What is React?"
- Questions must simulate real interview scenarios
- Each question must test understanding, not recall
- Keep questions concise but deep

${
  type === "mcq"
    ? `
MCQ REQUIREMENTS:
- Generate EXACTLY 5 questions
- Each question must have 4 options
- Only ONE correct answer
- Distractors (wrong options) must be realistic
- Correct answer must EXACTLY match one option

RETURN STRICT JSON ONLY:

{
  "questions": [
    {
      "question": "real-world technical question",
      "options": ["option A", "option B", "option C", "option D"],
      "correctAnswer": "exact matching option"
    }
  ]
}
`
    : `
LONG QUESTION REQUIREMENTS:
- Generate EXACTLY 3 questions
- Focus on explanation, debugging, tradeoffs, or architecture
- Prefer questions based on candidate's own projects
- Avoid vague questions

RETURN STRICT JSON ONLY:

{
  "questions": [
    {
      "question": "deep technical question"
    }
  ]
}
`
}

IMPORTANT:
- Output MUST be valid JSON
- Do NOT include explanations
- Do NOT include markdown
- Do NOT include extra text
`;

  const client = groq();
  const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content:
            "You are a strict JSON generator and senior interviewer. Output must be valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content || "";

    const parsed = extractJSON(content);

    if (!parsed?.questions) {
      throw new Error("Invalid AI response");
    }

    return parsed.questions;
  } catch (err) {
    console.error("AI Question Error:", err);
    return [];
  }
};

module.exports = { generateQuestions };

const getGroq = require("../config/groq");

function groq() {
  return getGroq();
}

// 🔥 safe JSON parser
const safeJSONParse = (text) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    return null;
  }
};

const extractStructuredData = async (text) => {
  try {
    const prompt = `
You are an expert resume parser.

Your task is to extract structured information from a resume.

IMPORTANT RULES:
- Return ONLY valid JSON
- Do NOT include any explanation
- Do NOT include markdown (like \`\`\`)
- If data is missing, return empty string or empty array
- Keep answers concise

Extract the following:

{
  "skills": ["array of technical skills"],
  "projects": [
    {
      "name": "project name",
      "description": "short 1-2 line summary"
    }
  ],

  "experience": "short summary of work experience",
  "education": "education details"
}

IMPORTANT:
- Extract ALL projects with meaningful summaries
- Summaries should describe what the project does and key tech
- Keep descriptions concise but informative

Resume:
${text}
`;

  const client = groq();
  const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2, // 🔥 more deterministic
      messages: [
        {
          role: "system",
          content:
            "You are a strict JSON generator. Always return valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();

    // 🔥 remove ```json ``` if model adds it
    const cleaned = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = safeJSONParse(cleaned);

    if (!parsed) {
      throw new Error("Invalid JSON from AI");
    }

    return parsed;

  } catch (error) {
    console.error("AI Resume Parsing Error:", error);

    // 🔥 fallback (VERY IMPORTANT)
    return {
      skills: [],
      projects: [],
      experience: "",
      education: "",
    };
  }
};

module.exports = { extractStructuredData };
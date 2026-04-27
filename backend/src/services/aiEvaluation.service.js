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

const evaluateAnswer = async (question, answer, context = "") => {
  try {
    const prompt = `
You are a senior technical interviewer at a top product-based company.

Evaluate the candidate’s answer rigorously.

QUESTION:
${question}

CANDIDATE ANSWER:
${answer}

${context ? `CANDIDATE CONTEXT:\n${context}` : ""}

EVALUATION CRITERIA:
1. Technical correctness
2. Depth of understanding
3. Clarity of explanation
4. Practical relevance
5. Edge case awareness

SCORING RUBRIC:
- 0–2 → incorrect / irrelevant
- 3–5 → partially correct, lacks depth
- 6–7 → good but missing depth or clarity
- 8–9 → strong answer with good depth and also well explained
- 10 → expert-level answer, exceptional, production-level answer

IMPORTANT RULES:
- DO NOT give any score by default
- Use FULL RANGE (0–10)
- Penalize missing edge cases
- Penalize lack of depth
- Reward real-world examples
- Reward tradeoffs discussion

RETURN STRICT JSON:

{
  "score": number (0-10),
  "feedback": "clear, specific feedback explaining strengths and weaknesses with detailed reasoning why this score was given",
  "improvement": "actionable suggestion to improve answer"
}

IMPORTANT:
- Be strict but fair
- Do NOT hallucinate
- Do NOT add extra text
- Output must be valid JSON only
`;

  const client = groq();
  const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: "You are a strict evaluator. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content || "";

    console.log("AI EVAL RAW:", content);

    const parsed = extractJSON(content);

    if (!parsed) {
      throw new Error("Invalid AI response");
    }

    return parsed;
  } catch (err) {
    console.error("AI Eval Error:", err);

    return {
      score: 0,
      feedback: "Evaluation failed",
      improvement: "",
    };
  }
};

module.exports = { evaluateAnswer };

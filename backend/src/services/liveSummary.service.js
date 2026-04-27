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

const generateLiveSummary = async (messages) => {
  try {
    const conversation = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    const prompt = `
You are a senior technical interviewer evaluating a candidate after a full interview.

OBJECTIVE:
Provide a realistic hiring evaluation based ONLY on the conversation.

EVALUATION DIMENSIONS:
1. Communication
   - clarity
   - structure
   - confidence

2. Technical Depth
   - understanding of concepts
   - ability to explain trade-offs
   - problem-solving ability

3. Strengths
   - what candidate did well

4. Weaknesses
   - specific gaps
   - missing depth
   - unclear thinking

5. Hiring Recommendation
   Choose ONE:
   - "Strong Hire"
   - "Hire"
   - "Borderline"
   - "No Hire"

CONVERSATION:
${conversation}

STRICT RULES:
- Be honest and critical (not overly nice)
- Do NOT hallucinate skills
- Base everything on conversation only
- Avoid generic phrases

OUTPUT JSON:
{
  "communication": "detailed evaluation",
  "technicalDepth": "detailed evaluation",
  "strengths": "specific strengths",
  "weaknesses": "specific weaknesses",
  "hireRecommendation": "Strong Hire | Hire | Borderline | No Hire with reasoning"
}
`;

  const client = groq();
  const res = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      messages: [
        { role: "system", content: "Return JSON only." },
        { role: "user", content: prompt },
      ],
    });

    return extractJSON(res.choices[0].message.content);
  } catch (err) {
    console.error("Summary error:", err);
    return null;
  }
};

module.exports = { generateLiveSummary };

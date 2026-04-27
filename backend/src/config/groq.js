const Groq = require("groq-sdk");

let _groq;
function getGroq() {
  if (_groq) return _groq;
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable is missing');
  }
  _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
}

module.exports = getGroq;

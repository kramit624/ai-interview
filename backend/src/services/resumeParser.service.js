const { PDFParse } = require("pdf-parse");

const parseResume = async (fileBuffer) => {
  try {
    // 🔥 pass buffer directly
    const parser = new PDFParse({ data: fileBuffer });

    const result = await parser.getText();

    return result.text;
  } catch (error) {
    console.error("PDF parsing failed:", error);
    return "";
  }
};

module.exports = { parseResume };

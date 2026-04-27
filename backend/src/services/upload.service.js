const ImageKit = require("@imagekit/nodejs");

let _imagekit;
function getImageKit() {
  if (_imagekit) return _imagekit;
  if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    throw new Error('IMAGEKIT configuration missing');
  }
  _imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
  return _imagekit;
}

const uploadToImageKit = async (file) => {
  const imagekit = getImageKit();
  const base64File = file.buffer.toString("base64");

  const result = await imagekit.files.upload({
    file: base64File,
    fileName: file.originalname,
    folder: "/resumes",
  });

  return result.url;
};

module.exports = { uploadToImageKit };

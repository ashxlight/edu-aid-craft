import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage(); // store in memory to process it directly without saving to disk first

const fileFilter = (req, file, cb) => {
  const filetypes = /pdf|doc|docx|txt/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  const mimetypes = /pdf|msword|wordprocessingml|text\/plain/;
  const mimetype = mimetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Only pdf, doc, docx, and txt files are allowed!'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

export default upload;

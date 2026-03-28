import express from 'express';
import upload from '../middleware/upload.js';
import { extractText } from '../services/fileService.js';
import { protect } from './auth.js';
import Document from '../models/Document.js';
import History from '../models/History.js';

const router = express.Router();

// @route   POST /api/documents/upload
// @desc    Upload document and save to database (Teacher Only)
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can upload documents.' });
    }

    let text = req.body.text || '';
    let title = req.body.title || 'Untitled Document';
    const gradeLevel = req.body.gradeLevel || 'Medium';
    const standard = req.body.standard || 1;

    if (req.file) {
      text = await extractText(req.file.buffer, req.file.mimetype);
      if (!req.body.title) {
        title = req.file.originalname; // Use file name as default title
      }
    }

    if (!text.trim()) {
      return res.status(400).json({ message: 'No content provided.' });
    }

    const newDoc = await Document.create({
      title,
      content: text,
      gradeLevel,
      standard: parseInt(standard) || 1, // Fallback if missing
      uploadedBy: req.user._id
    });

    await History.create({
      userId: req.user._id,
      action: 'upload',
      title,
      documentId: newDoc._id,
      metadata: { gradeLevel, standard: parseInt(standard) || 1 }
    });

    res.status(201).json(newDoc);
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ message: error.message || 'Error uploading document' });
  }
});

// @route   GET /api/documents
// @desc    Get list of all documents (For Students & Teachers)
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.query.standard && req.query.standard !== 'All') {
      query.standard = parseInt(req.query.standard);
    }

    const documents = await Document.find(query)
      .select('title gradeLevel standard createdAt uploadedBy')
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
      
    res.json(documents);
  } catch (error) {
    console.error('Fetch documents error:', error);
    res.status(500).json({ message: 'Error fetching documents' });
  }
});

// @route   GET /api/documents/:id
// @desc    Get specific document content
router.get('/:id', protect, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching document' });
  }
});

export default router;

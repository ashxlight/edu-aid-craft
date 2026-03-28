import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String, // 'upload' or 'generate'
    required: true,
    enum: ['upload', 'generate']
  },
  title: {
    type: String, // To store document title without deep population
    required: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  },
  metadata: {
    // Stores optional context: formats, disability, gradeLevel
    formats: [String],
    disability: String,
    gradeLevel: String
  }
}, { timestamps: true });

export default mongoose.model('History', HistorySchema);

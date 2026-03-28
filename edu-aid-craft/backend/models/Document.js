import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true }, // The extracted text content
  roleContext: { type: String, default: 'General' }, // Optional: subject/context
  gradeLevel: { type: String, default: 'Medium' }, // Easy/Medium/Hard/Advanced estimation or tag
  standard: { type: Number, required: true, min: 1, max: 12 }, // Grade 1 to 12
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Document', DocumentSchema);

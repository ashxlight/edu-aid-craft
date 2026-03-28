import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  role: { type: String, default: 'student', enum: ['student', 'teacher'] },
  disability: { 
    type: String, 
    enum: ['ADHD', 'Dyslexia', 'Visual Impairment', 'ASD', 'APD', 'None'],
    default: 'None'
  },
  grade: { type: String, default: 'Middle School' } // Elementary, Middle School, High School, etc.
}, { timestamps: true });

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

export default mongoose.model('User', UserSchema);

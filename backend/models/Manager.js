import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const managerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true,
    minlength: 6
  },

  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }

}, { timestamps: true });


// ✅ Hash password before saving
managerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


// ✅ Password check method for login
managerSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('Manager', managerSchema);

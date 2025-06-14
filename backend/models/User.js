import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    lowercase: true
  },

  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },

  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }]
  
}, { timestamps: true });

export default mongoose.model('User', userSchema);

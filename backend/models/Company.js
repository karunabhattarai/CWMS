import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  description: {
    type: String,
    default: ''
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // superadmin huna parxa 
    required: false
  }

}, { timestamps: true });

export default mongoose.model('Company', companySchema);

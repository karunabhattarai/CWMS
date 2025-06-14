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
    ref: 'Manager',
    required: true
  }

}, { timestamps: true });

export default mongoose.model('Company', companySchema);

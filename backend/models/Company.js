import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  address: {
    type: String,
  },
  contactEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  contactPhone: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Company = mongoose.model('Company', companySchema);
export default Company;

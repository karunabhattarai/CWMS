import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
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
    minlength: 6,
    select: false
  },
  role:{
    type : String,
    enum: ['superadmin', 'manager', 'employee'],
    required: true,
    default: 'employee' // option dinu pardaina frontendma, just have for superdmin and give superadmin power to make manager,and users

  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    // required: true since super admin is also added, he can exist witour coompany
    required: function() {
      // company is required for managers and employees only, not for superadmin
      return this.role === 'manager'|| this.role === 'employee';
    }
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: function () {
      // required for employee, optional for superadmin
      return this.role === 'employee';
    }
  },
  isVerified: {
  type: Boolean,
  default: false
  },

  verificationToken: {
    type: String,
    default: null
  },
  resetPasswordToken: {
  type: String,
  default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  }

}, { timestamps: true });


//Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


//Password check method for login
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);

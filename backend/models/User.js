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
    minlength: 6
  },
  role:{
    type : String,
    enum: ['superadmin', 'manager'],
    required: true,
    default: 'manager' // option dinu pardaina frontendma, just have for superdmin and give superadmin power to make manager
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    // required: true since super admin is also added, he can exist witour coompany
    required: function() {
      // company is required for managers only, not for superadmin
      return this.role === 'manager';
    }
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

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Permission Schema
const permissionSchema = new mongoose.Schema({
  module: { type: String },
  subModule: { type: String },
  auto: {
    view: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  ownData: {
    view: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  otherUserData: {
    view: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  }
});


const userSchema = new mongoose.Schema({
  image: { type: String, default: '' }, 
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  designation: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },

  userRole: { type: mongoose.Schema.Types.ObjectId, ref: 'UserRole' },

  enableCustomAccess: { type: Boolean, default: false },

  isVerified: { type: Boolean, default: false },
  otp: { type: Number },
  otpExpiry: { type: Date },

  customPermissions: {
    type: [permissionSchema],
    default: []
  }
}, { timestamps: true });


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});


userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


const User = mongoose.model('User', userSchema);
export default User;

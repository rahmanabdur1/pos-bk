// models/userRole.model.js
import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  module: String,
  subModule: String,
  auto: {
    view: Boolean,
    edit: Boolean,
    delete: Boolean
  },
  ownData: {
    view: Boolean,
    edit: Boolean,
    delete: Boolean
  },
  otherUserData: {
    view: Boolean,
    edit: Boolean,
    delete: Boolean
  }
});

const userRoleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  permissions: [permissionSchema],
  createdBy: String,
  updatedBy: String,
  authorizedBy: String,
  authorizedAt: Date,
  authorized: {
    type: String,
    enum: ['Approved', 'Pending', 'Rejected'],
    default: 'Pending',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Inactive',
  }
}, { timestamps: true });

const UserRole = mongoose.model('UserRole', userRoleSchema);
export default UserRole;
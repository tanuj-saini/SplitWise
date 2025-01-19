import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true,
        index : true
     },
    profilePicture: { type: String },
    phoneNumber: { type: String, unique: true },
    joinedGroups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = model('User', userSchema);

export default User;

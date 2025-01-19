import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: { 
      type: String,
      required: true,
      index : true
     },
    profilePicture: { 
      type: String,
      required: true
     },
    phoneNumber: { 
      type: String,
       unique: true },
    joinedGroups: [{
       type: Schema.Types.ObjectId,
        ref: 'Group' }],
   
  },
  { timestamps: true }
);

const User = model('User', userSchema);

export default User;

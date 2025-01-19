import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    username: { 
      type: String,
      required: true,
      trim: true,
      index : true
     },
    profilePicture: { 
      type: String,
      required: true
     },
    phoneNumber: { 
      type: String,
       unique: true ,
       required: true,
       index : true
      },
    password : {
      type: String,
        required: [true,"Password is required"],
       },
       refreshToken: {
        type: String,
        
    },
    joinedGroups: [{
       type: Schema.Types.ObjectId,
        ref: 'Group' }],
   
  },
  { timestamps: true }
);
userSchema.pre("save", async function(next) {
  if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});
userSchema.methods.comparePassword = async function( password) {
  return await bcrypt.compare( password,this.password);
};

userSchema.methods.generateToken = function () {
  return jwt.sign(
      {
          _id: this._id,
          username: this.username,
         
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY
      }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
      {
          _id: this._id,
          username: this.username,
        
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRY
      }
  );
};


const User = model('User', userSchema);

export default User;

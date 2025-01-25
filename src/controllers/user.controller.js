import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/user.model.js";




//Tokens
const refreshAccessToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken|| req.headers["refresh_token"]?.replace("Bearer ", ""); 
    if (!refreshToken) {

        return res.status(402).json(new ApiError(402, "Unauthorized"));
    }
    try {
        const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if (!user) {

            
            return res.status(404).json(new ApiError(404, "User not found"));
        }
        if(user?.refreshToken !== refreshToken){
     
            return res.status(402).json(new ApiError(402,"Refresh Token Expired"));
        }
        const options = {
            httpOnly:true,
            secure:trueu
        }
        const {accessToken,newRefreshToken} = await generateRefreshTokenandAccessToken(user._id);
        return res.status(200).cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(new ApiResponse(200,{accessToken,newRefreshToken},"Token refreshed successfully"));
    } catch (error) {
  
        return res.status(402).json(new ApiError(401, error?.message || "Invalid Refresh Token"));
        
    }
});



const generateRefreshTokenandAccessToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
     
            return res.status(404).json(new ApiError(404, "User not found"));
        }
        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { refreshToken, accessToken };
    } catch (error) {

        return res.status(500).json(new ApiError(500, "Error generating tokens"));
    }
};

// Register a new user
const registerUser = asyncHandler(async (req, res) => {
    const { username, profilePicture, phoneNumber, password, upiId } = req.body;
  
    if (!username || !profilePicture || !phoneNumber || !password || !upiId) {
      return res.status(400).json(new ApiError(400, "All fields are required"));
    }
  
    const existingUser = await User.findOne({ 
      phoneNumber, 
      upiId 
    });
    if (existingUser) {
      return res.status(400).json(new ApiError(400, "Phone number already in use"));
    }
  
    const user = await User.create({ username, profilePicture, phoneNumber, password,upiId });
    const newUser = await User.findById(user._id).select("-password ");
    res.status(201).json(new ApiResponse(201, newUser, "User registered successfully"));
  });


  
  // Login a user
  const loginUser = asyncHandler(async (req, res) => {
    const { phoneNumber, password } = req.body;
  
    
    if (!phoneNumber || !password) {
      return res
        .status(400)
        .json(new ApiError(400, "Phone number and password are required"));
    }
  

    const user = await User.findOne({ phoneNumber });
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json(new ApiError(401, "Invalid credentials"));
    }
  

    const accessToken = user.generateToken();
    const refreshToken = user.generateRefreshToken();
  
    
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
  
   
    const userResponse = await User.findById(user._id).select("-password -refreshToken");

    const options = { httpOnly: true, secure: true };
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, { user: userResponse, accessToken, refreshToken }, "Login successful"));
  });
  
  
  // Logout a user
  const logoutUser = asyncHandler(async (req, res) => {
    
    await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { refreshToken: 1 } }, 
      { new: true } 
    );
  
    
    const options = {
      httpOnly: true, 
      secure: true 
    };
  

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged out"));
  });
  
  
  // Get user details
  const getUserDetails = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    if (!user) {

        return res.status(404).json(new ApiError(404, "User not found"));
    }
    return res.status(200).json(new ApiResponse(200, user, "User found"));
  });


  
  // Update user details
  const updateUserDetails = asyncHandler(async (req, res) => {
    const {profilePicture , username } = req.body;
    if (!profilePicture  || !username) {

        return res.status(400).json(new ApiError(400, "At least one field is required"));
    }
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set :{
          profilePicture , username
    
    }
} ,{
        new: true,
      
    }).select("-password -refreshToken");
    if (!user) {
      
        return res.status(404).json(new ApiError(404, "User not found"));
    }
    return res.status(200).json(new ApiResponse(200, user, "User updated successfully"));
  });



  
  const changePassword = asyncHandler(async (req, res)=> {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {

        return res.status(400).json(new ApiError(400, "Old password and new password are required"));
    }
    const user =await User.findById(req.user?._id);
    if (!user) {
     
        return res.status(404).json(new ApiError(404, "User not found"));
    }
    const isPasswordMatch = await user.comparePassword(oldPassword);
    if (!isPasswordMatch) {
  
        return res.status(402).json(new ApiError(402, "Invalid credentials"));
    }
    user.password = newPassword;
    await user.save({
        validateBeforeSave: false
    });
    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));

});


  export {registerUser,loginUser,logoutUser,refreshAccessToken,getUserDetails,updateUserDetails,changePassword};
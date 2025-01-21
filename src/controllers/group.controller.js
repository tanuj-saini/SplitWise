import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Group from "../models/group.model.js";


const createGroup = asyncHandler(async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json(new ApiError(401, "Unauthorized user"));
      }

    const { name, members } = req.body;
  

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json(new ApiError(400, "Group name is required and must be valid"));
    }
  

    if (!req.user || !req.user._id) {
      return res.status(401).json(new ApiError(401, "Unauthorized user"));
    }
  
    
    if (!members || members.length === 0) {
      return res.status(400).json(new ApiError(400, "At least one member is required to create a group"));
    }
  
    const uniqueMembers = [...new Set(members.map(String))]; // Ensure IDs are unique and as strings
    if (uniqueMembers.length < 1) {
      return res.status(400).json(new ApiError(400, "At least one member (besides yourself) is required to create a group"));
    }
  
    
    const memberCount = await User.aggregate([
      {
        $match: {
          _id: { $in: uniqueMembers.map(id => new mongoose.Types.ObjectId(id)) },
        },
      },
      { $count: "count" },
    ]);
  
    if (!memberCount[0] || memberCount[0].count !== uniqueMembers.length) {
      return res.status(400).json(new ApiError(400, "One or more members are invalid or not found"));
    }
  
   
    const allMembers = [...new Set([req.user._id.toString(), ...uniqueMembers])];
  
    if (allMembers.length <= 1) {
      return res.status(400).json(new ApiError(400, "A group must have more than one member"));
    }
  

    const group = await Group.create({
      name: name.trim(),
      createdBy: req.user._id,
      members: allMembers,
    });
  

    await User.updateMany(
      { _id: { $in: allMembers.map(id => new mongoose.Types.ObjectId(id)) } },
      { $addToSet: { joinedGroups: group._id } }
    );
  
    return res
      .status(201)
      .json(new ApiResponse(201, group, "Group created successfully"));
  });
  



const getGroupDetails = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    if (!req.user || !req.user._id) {
        return res.status(401).json(new ApiError(401, "Unauthorized user"));
      }
    
    
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json(new ApiError(400, "Invalid group ID"));
    }
  
    
    const group = await Group.findById(groupId)
      .populate({
        path: "members",
        select: "username profilePicture phoneNumber", 
      })
      .populate({
        path: "expenses",
        select: "description amount paidBy splitAmong splitType createdAt", 
        populate: {
          path: "paidBy splitAmong",
          select: "username profilePicture", 
        },
      });
  
    
    if (!group) {
      return res.status(404).json(new ApiError(404, "Group not found"));
    }
  
   
    const isMember = group.members.some(
      (member) => member._id.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json(new ApiError(403, "Access denied to this group"));
    }
  
    
    return res
      .status(200)
      .json(new ApiResponse(200, group, "Group details retrieved successfully"));
  });
  

  const updateGroupDetails = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { name, members } = req.body;
  
    // Ensure the user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json(new ApiError(401, "Unauthorized user"));
    }
  
    // Validate group ID
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json(new ApiError(400, "Invalid group ID"));
    }
  
    // Fetch the group details
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json(new ApiError(404, "Group not found"));
    }
  
    // Check if the user is a member of the group
    const isMember = group.members.some(
      (member) => member.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json(new ApiError(403, "Access denied to this group"));
    }
  
    // Validate and process new members
    let newMembers = [];
    if (members) {
      // Ensure all new members are registered users
      const existingUsers = await User.find({ _id: { $in: members } }).select("_id");
      const existingUserIds = existingUsers.map((user) => user._id.toString());
  
      const invalidMembers = members.filter(
        (member) => !existingUserIds.includes(member.toString())
      );
      if (invalidMembers.length > 0) {
        return res.status(400).json(
          new ApiError(
            400,
            `Some members are not registered: ${invalidMembers.join(", ")}`
          )
        );
      }
  
      // Identify new members to add
      newMembers = members.filter(
        (member) => !group.members.includes(member.toString())
      );
    }
  
    // Update the group details
    if (name) group.name = name;
    if (members) group.members = [...new Set([...group.members, ...newMembers])];
  
    // Save the updated group
    await group.save();
  
    // Update the joinedGroups field for newly added members
    if (newMembers.length > 0) {
      await User.updateMany(
        { _id: { $in: newMembers } },
        { $addToSet: { joinedGroups: group._id } }
      );
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, group, "Group details updated successfully"));
  });

  
  export { createGroup ,getGroupDetails,updateGroupDetails };
  



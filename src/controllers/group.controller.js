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
  

  
  export { createGroup ,getGroupDetails };
  




//   //expense
//   export const addExpense = asyncHandler(async (req, res) => {
//     const { groupId, description, amount, paidBy, splitAmong, splitType } = req.body;
//     const group = await Group.findById(groupId);
//     if (!group) {
//       return res.status(404).json(new ApiError(404, "Group not found"));
//     }
//     const expense = await Expense.create({ groupId, description, amount, paidBy, splitAmong, splitType });
//     group.expenses.push(expense._id);
//     await group.save();
//     res.status(201).json(new ApiResponse(201, expense, "Expense added successfully"));
//   });

  
//   // balamce
//   export const getBalanceSheet = asyncHandler(async (req, res) => {
//     const balances = await Balance.find({ groupId: req.params.groupId }).populate("owner receiver");
//     res.status(200).json(new ApiResponse(200, balances, "Balance sheet fetched successfully"));
//   });
  
//   export const markBalanceAsPaid = asyncHandler(async (req, res) => {
//     const balance = await Balance.findById(req.params.id);
//     if (!balance) {
//       return res.status(404).json(new ApiError(404, "Balance not found"));
//     }
//     balance.markAsPaid = true;
//     await balance.save();
//     res.status(200).json(new ApiResponse(200, balance, "Balance marked as paid"));
//   });
  
import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Expense from "../models/Expense.model.js";
import Balance from "../models/balance.model.js";
import mongoose  from "mongoose";

const updateBalanceSheet = asyncHandler(async (req, res) => {
  const { balanceId, paid, markAsPaid } = req.body;

  // Validate balanceId
  if (!mongoose.Types.ObjectId.isValid(balanceId)) {
    return res.status(400).json(new ApiError(400, 'Invalid balance ID'));
  }

  // Find the balance record
  const balance = await Balance.findById(balanceId);
  if (!balance) {
    return res.status(404).json(new ApiError(404, 'Balance record not found'));
  }

  // Update `paid` or `markAsPaid` in the balance record
  if (typeof paid !== 'undefined') balance.paid = paid;
  if (typeof markAsPaid !== 'undefined') balance.markAsPaid = markAsPaid;

  // Save the updated balance record
  await balance.save();

  // Update the expense's `paidBy` array if `paid` or `markAsPaid` is true
  if (paid || markAsPaid) {
    const expense = await Expense.findById(balance.expenseId);
    if (!expense) {
      return res.status(404).json(new ApiError(404, 'Associated expense not found'));
    }

    const receiverId = balance.owner.toString();
    console.log(receiverId)
    if (!expense.paidBy.some(id => id.toString() === receiverId)) {
      expense.paidBy = [...expense.paidBy, receiverId];

      // Save the updated expense record
      await expense.save();
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, balance, 'Balance sheet and expense updated successfully'));
});



const getBalanceId = asyncHandler(async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json(new ApiError(401, "Unauthorized user"));
    }
    const { groupId, expenseId } = req.body;
    const ownerId = req.user._id;

    // Validate required fields
    if (!groupId || !expenseId || !ownerId) {
      return res.status(400).json(new ApiError(404, 'Missing required fields'));

    }

    // Find the balance record
    const balance = await Balance.findOne({
      groupId,
      expenseId,
      owner: ownerId
    });

    // Check if balance record exists
    if (!balance) {
      
      return res.status(404).json(new ApiError(404, 'Balance record not found'));
     

    }

    // Return balance ID
    return res
    .status(200)
    .json(new ApiResponse(200, balance._id, 'Balance sheet and expense updated successfully'));
    
  } catch (error) {
    console.error("Error fetching balance ID:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});



export {updateBalanceSheet,getBalanceId}
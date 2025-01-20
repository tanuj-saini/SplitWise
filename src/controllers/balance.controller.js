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




export {updateBalanceSheet}

import { ApiError } from '../utils/ApiError.js';
import ApiResponse  from '../utils/ApiResponse.js';
import Transaction from '../models/Transaction.model.js';
import Group from '../models/group.model.js';
import Balance from '../models/balance.model.js';
import Expense from '../models/Expense.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import mongoose from 'mongoose';



const createTransaction = asyncHandler(async (req, res) => {
    const { groupId, payer, payee, amount, balanceId, expenseId, transactionId, status } = req.body;
  
    // Validate required fields
    if (!groupId || !payer || !payee || !amount || !balanceId || !expenseId || !status) {
      return res.status(400).json(new ApiError(400, "All fields are required"));
    }
  
    // Validate group, balance, and expense existence
    const group = await Group.findById(groupId);
    const balance = await Balance.findById(balanceId);
    const expense = await Expense.findById(expenseId);
  
    if (!group) return res.status(404).json(new ApiError(404, "Group not found"));
    if (!balance) return res.status(404).json(new ApiError(404, "Balance not found"));
    if (!expense) return res.status(404).json(new ApiError(404, "Expense not found"));
  
    // Create the transaction
    const transaction = await Transaction.create({
      groupId,
      payer,
      payee,
      amount,
      balanceId,
      expenseId,
      transactionId: transactionId || null,
      status,
    });
  
    return res
      .status(201)
      .json(new ApiResponse(200, transaction, "Transaction created successfully"));
  });







  const updateTransaction = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;
    const { status } = req.body;
  
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return res.status(400).json(new ApiError(400, "Invalid transaction ID"));
    }
  
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json(new ApiError(404, "Transaction not found"));
    }
  
    // Update only the allowed fields (status in this case)
    if (status) transaction.status = status;
  
    await transaction.save();
  
    return res
      .status(200)
      .json(new ApiResponse(200, transaction, "Transaction updated successfully"));
  });






  const getTransactionsByGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
     const group = await Group.findById(groupId);
     if (!group) return res.status(404).json(new ApiError(404, "Group not found"));
  
    const transactions = await Transaction.find({ groupId })
      .populate("payer", "username profilePicture")
      .populate("payee", "username profilePicture")
      .populate("expenseId", "description amount")
      .populate("balanceId", "totalAmount remainingAmount");
  
    if (!transactions.length) {
      return res
        .status(404)
        .json(new ApiError(404, "No transactions found for the group"));
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, transactions, "Transactions retrieved successfully"));
  });

  
  
  const getTransactionById = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return res.status(400).json(new ApiError(400, "Invalid transaction ID"));
    }
  
    const transaction = await Transaction.findById(transactionId)
      .populate("payer", "username profilePicture")
      .populate("payee", "username profilePicture")
      .populate("groupId", "name")
      .populate("expenseId", "description amount")
      .populate("balanceId", "totalAmount remainingAmount");
  
    if (!transaction) {
      return res.status(404).json(new ApiError(404, "Transaction not found"));
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, transaction, "Transaction retrieved successfully"));
  });
  


  

  
  export { createTransaction, updateTransaction , getTransactionsByGroup,getTransactionById };

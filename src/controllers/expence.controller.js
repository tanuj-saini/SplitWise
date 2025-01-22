

import Balance from "../models/balance.model.js";
import Expense from "../models/Expense.model.js";
import Group from "../models/group.model.js";

import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Helper functions (no change required)

const validateGroupMembers = (groupMembers, userIds) => {
  return userIds.filter((userId) => !groupMembers.includes(userId));
};

const calculateSplits = (amount, paidBy, splitAmong, splitType, manualSplit) => {
  let balanceSheet = {};
  let detailedSplit = [];

  if (splitType === "amount" && manualSplit) {
    Object.entries(manualSplit).forEach(([user, splitAmount]) => {
      paidBy.forEach((payer) => {
        if (payer.toString() !== user) {
          if (!balanceSheet[payer]) balanceSheet[payer] = {};
          if (!balanceSheet[payer][user]) balanceSheet[payer][user] = 0;

          balanceSheet[payer][user] += splitAmount;

          detailedSplit.push({
            from: user,
            to: payer,
            amount: splitAmount,
          });
        }
      });
    });
  } else if (splitType === "equal") {
    const splitAmount = amount / splitAmong.length;

    splitAmong.forEach((user) => {
      paidBy.forEach((payer) => {
        if (payer.toString() !== user) {
          if (!balanceSheet[payer]) balanceSheet[payer] = {};
          if (!balanceSheet[payer][user]) balanceSheet[payer][user] = 0;

          balanceSheet[payer][user] += splitAmount;

          detailedSplit.push({
            from: user,
            to: payer,
            amount: splitAmount,
          });
        }
      });
    });
  }

  return { balanceSheet, detailedSplit };
};

const simplifyBalances = (balanceSheet) => {
  const simplified = {};

  Object.keys(balanceSheet).forEach((payer) => {
    Object.keys(balanceSheet[payer]).forEach((payee) => {
      const amountOwed = balanceSheet[payer][payee];
      const reverseAmount = (simplified[payee]?.[payer] || 0);

      if (!simplified[payer]) simplified[payer] = {};

      if (amountOwed > reverseAmount) {
        simplified[payer][payee] = amountOwed - reverseAmount;
        if (simplified[payee]) delete simplified[payee][payer];
      } else {
        if (!simplified[payee]) simplified[payee] = {};
        simplified[payee][payer] = reverseAmount - amountOwed;
        delete simplified[payer][payee];
      }
    });
  });

  return simplified;
};





// return res.status(400).json(new ApiError(400, "Old password and new password are required"));


// Controller methods using asyncHandler

const createExpense = asyncHandler(async (req, res) => {
  const { groupId, description, amount, paidBy, splitAmong, splitType, manualSplit } = req.body;
  if (!mongoose.isValidObjectId(groupId)) {
    return res.status(400).json(new ApiError(400, "Invalid Group ID format"));
  }
  // Step 1: Validate Group
  const group = await Group.findById(groupId);
  if (!group || group==null) 
  return res.status(404).json(new ApiError(404, "Group not found"));

  // Step 2: Validate Users in Group
  const invalidUsers = validateGroupMembers(group.members, [...paidBy, ...splitAmong]);
  if (invalidUsers.length > 0) {
   
    return res.status(404).json(new ApiError(404, "Some users are not members of the group"));
  }

  // Step 3: Validate Manual Split
  if (splitType === "amount" && manualSplit) {
    const totalManualSplit = Object.values(manualSplit).reduce((sum, value) => sum + value, 0);
    if (totalManualSplit !== amount) {
      
      return res.status(400).json(new ApiError(400, "Manual split amounts do not match the total expense amount"));
    }
  }

  // Step 4: Calculate Splits
  const { balanceSheet, detailedSplit } = calculateSplits(amount, paidBy, splitAmong, splitType, manualSplit);

  // Step 5: Create Expense Document
  const expense = new Expense({
    groupId,
    description,
    amount,
    paidBy,
    splitAmong,
    splitType,
    detailedSplit,
  });

  await expense.save();

  // Step 6: Update Group Expenses
  group.expenses.push(expense._id);
  await group.save();

  // Step 7: Create New Balances for Each Relationship
  const balancePromises = [];

  Object.keys(balanceSheet).forEach((payerId) => {
    const payees = balanceSheet[payerId];
    Object.keys(payees).forEach((payeeId) => {
      const balanceAmount = payees[payeeId];

      balancePromises.push(
        Balance.create({
          groupId,
          owner: payeeId,
          reciver: payerId,
          balance: balanceAmount,
          expenseId: expense._id,
          paid: false,
          markAsPaid: false,
        })
      );
    });
  });

  await Promise.all(balancePromises);

 
 return res.status(200).json(new ApiResponse( 200,expense, "Expense created successfully"));

});





const updateExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  const { description, amount, paidBy, splitAmong, splitType, manualSplit } = req.body;
  if (!mongoose.isValidObjectId(expenseId)) {
    return res.status(400).json(new ApiError(400, "Expense not found"));
  }
  const expense = await Expense.findById(expenseId);
  if (!expense) 
  return res.status(404).json(new ApiError(404, "Expense not found"));

  let shouldUpdateBalances = false;

  // Update description if provided
  if (description) expense.description = description;

  // Check if amount has changed
  if (amount && amount !== expense.amount) {
    shouldUpdateBalances = true;
    expense.amount = amount;
  }
  // if (!mongoose.isValidObjectId(paidBy)) {
  //   return res.status(400).json(new ApiError(400, "No such user"));
  // }
  // Update paidBy and splitAmong if provided
  if (paidBy) expense.paidBy = paidBy;
  if (splitAmong) expense.splitAmong = splitAmong;

  // Update splitType and manualSplit if provided
  if (splitType) expense.splitType = splitType;

  // Recalculate splits and update balances only if required
  if (shouldUpdateBalances) {
    const { balanceSheet, detailedSplit } = calculateSplits(
      expense.amount,
      paidBy || expense.paidBy,
      splitAmong || expense.splitAmong,
      splitType || expense.splitType,
      manualSplit || expense.manualSplit
    );

    expense.balanceSheet = balanceSheet;
    expense.detailedSplit = detailedSplit;

    await Balance.updateMany(
      { expenseId },
      { $set: { balance: 0 } } // Reset balances to avoid cumulative addition
    );

    const balanceUpdates = [];
    Object.keys(balanceSheet).forEach((payerId) => {
      const payees = balanceSheet[payerId];

      Object.keys(payees).forEach((payeeId) => {
        const balanceAmount = payees[payeeId];

        balanceUpdates.push({
          updateOne: {
            filter: { groupId: expense.groupId, owner: payeeId, reciver: payerId, expenseId: expense._id },
            update: { $set: { balance: balanceAmount } },
            upsert: true,
          },
        });
      });
    });

    if (balanceUpdates.length > 0) {
      await Balance.bulkWrite(balanceUpdates);
    }
  }

  await expense.save();


  return res.status(200).json(new ApiResponse( 200, expense, "Expense updated successfully"));
});






const getExpensesByGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { minAmount, maxAmount, startDate, endDate, paidBy, splitAmong, description, page, limit } = req.query;

  // Validate groupId
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json(new ApiError(400, "Invalid group ID"));
  }

  const query = { groupId };

  // Filter by amount range
  if (minAmount || maxAmount) {
    query.amount = {};
    if (minAmount) query.amount.$gte = Number(minAmount);
    if (maxAmount) query.amount.$lte = Number(maxAmount);
  }

  // Filter by date range
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Filter by paidBy
  if (paidBy) {
    query.paidBy = { $in: paidBy.split(",") };
  }

  // Filter by splitAmong
  if (splitAmong) {
    query.splitAmong = { $in: splitAmong.split(",") };
  }

  // Filter by description (case-insensitive search)
  if (description) {
    query.description = { $regex: description, $options: "i" };
  }

  // Pagination logic
  const currentPage = parseInt(page, 10) || 1;
  const pageSize = parseInt(limit, 10) || 10;
  const skip = (currentPage - 1) * pageSize;

  // Fetch expenses with selective fields for `paidBy` and `splitAmong`
  const expenses = await Expense.find(query)
    .populate("paidBy", "username profilePicture")
    .populate("splitAmong", "username profilePicture")
    .skip(skip)
    .limit(pageSize);


  
  // Get total count for pagination metadata
  const totalExpenses = await Expense.countDocuments(query);

  // Response with expenses and pagination metadata
  return res.status(200).json(
    new ApiResponse(200, {
      expenses,
      pagination: {
        currentPage,
        pageSize,
        totalExpenses,
        totalPages: Math.ceil(totalExpenses / pageSize),
      },
    }, "Expenses retrieved successfully")
  );
});



const deleteExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  const userId = req.user._id;

  const expense = await Expense.findById(expenseId);
  if (!expense) 
  return res.status(404).json(new ApiError(404, "Expense not found"));

  if (!expense.paidBy.includes(userId)) {
   
    return res.status(403).json(new ApiError(403, "You are not authorized to delete this expense"));
  }

  const group = await Group.findById(expense.groupId);
  if (group) {
    group.expenses = group.expenses.filter((id) => id.toString() !== expenseId);
    await group.save();
  }

  await Balance.deleteMany({ expenseId });

  await expense.remove();

  
 return res.status(200).json(new ApiResponse( 200,null, "Expense and associated balances deleted successfully"));
});




const calculateGroupBalances = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const expenses = await Expense.find({ groupId });
  if (!expenses || expenses.length === 0) {

    return res.status(404).json(new ApiError(404, "No expenses found for this group"));
    
  }

  const balanceSheet = {};

  expenses.forEach((expense) => {
    const { amount, paidBy, splitAmong, splitType, detailedSplit } = expense;

    if (splitType === "equal") {
      const splitAmount = amount / splitAmong.length;

      paidBy.forEach((payer) => {
        splitAmong.forEach((user) => {
          if (payer.toString() !== user.toString()) {
            if (!balanceSheet[payer]) balanceSheet[payer] = {};
            if (!balanceSheet[payer][user]) balanceSheet[payer][user] = 0;

            balanceSheet[payer][user] += splitAmount;
          }
        });
      });
    } else if (splitType === "amount") {
      detailedSplit.forEach(({ from, to, amount }) => {
        if (!balanceSheet[to]) balanceSheet[to] = {};
        if (!balanceSheet[to][from]) balanceSheet[to][from] = 0;

        balanceSheet[to][from] += amount;
      });
    }
  });

  const simplifiedBalanceSheet = simplifyBalances(balanceSheet);


 return res.status(200).json(new ApiResponse( 200,simplifiedBalanceSheet, "Calculate Group Expense"));
});



// get expence by expence id
const getExpenseById = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;

  // Validate expenseId
  if (!mongoose.isValidObjectId(expenseId)) {
    return res.status(400).json(new ApiError(400, "Invalid Expense ID format"));
  }

  // Find the expense with selective population
  const expense = await Expense.findById(expenseId)
    .populate("paidBy", "username profilePicture")
    .populate("splitAmong", "username profilePicture");

  if (!expense) {
    return res.status(404).json(new ApiError(404, "Expense not found"));
  }

  return res.status(200).json(new ApiResponse(200, expense, "Expense retrieved successfully"));
});




export { calculateGroupBalances, createExpense, deleteExpense, getExpenseById, getExpensesByGroup, updateExpense };


import Expense from '../models/Expense.model.js';
import Group from "../models/group.model.js";


// Create a new expense
export const createExpense = async (req, res) => {
  const { groupId, description, amount, paidBy, splitAmong, splitType } = req.body;

  try {

    // if (!req.user || !req.user._id) {
    //     return res.status(401).json(new ApiError(401, "Unauthorized user"));
    //   }
    // Validate group existence
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Ensure all users exist in the group
    const invalidUsers = [...paidBy, ...splitAmong].filter(
      (userId) => !group.members.includes(userId)
    );
    if (invalidUsers.length > 0) {
      return res.status(400).json({ message: 'Some users are not members of the group' });
    }

    // Create the expense
    const expense = new Expense({
      groupId,
      description,
      amount,
      paidBy,
      splitAmong,
      splitType,
    });
    await expense.save();

    // Add expense to the group's expenses array
    group.expenses.push(expense._id);
    await group.save();

    res.status(201).json({ message: 'Expense created successfully', expense });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};


export const getExpensesByGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    const expenses = await Expense.find({ groupId }).populate('paidBy splitAmong');
    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};
 // update Expence

 

export const updateExpense = async (req, res) => {
  const { expenseId } = req.params;
  const { description, amount, paidBy, splitAmong, splitType } = req.body;

  try {
    const expense = await Expense.findById(expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    // Update fields
    if (description) expense.description = description;
    if (amount) expense.amount = amount;
    if (paidBy) expense.paidBy = paidBy;
    if (splitAmong) expense.splitAmong = splitAmong;
    if (splitType) expense.splitType = splitType;

    await expense.save();
    res.status(200).json({ message: 'Expense updated successfully', expense });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

export const calculateGroupBalances = async (req, res) => {
  const { groupId } = req.params;

  try {
    const expenses = await Expense.find({ groupId });
    const balanceSheet = {};

    expenses.forEach((expense) => {
      const { amount, paidBy, splitAmong, splitType } = expense;
      const splitAmount = splitType === 'equal' ? amount / splitAmong.length : null;

      paidBy.forEach((payer) => {
        splitAmong.forEach((user) => {
          if (payer !== user) {
            if (!balanceSheet[payer]) balanceSheet[payer] = {};
            if (!balanceSheet[payer][user]) balanceSheet[payer][user] = 0;

            balanceSheet[payer][user] += splitAmount;
          }
        });
      });
    });

    res.status(200).json(balanceSheet);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};




/*
  import express from 'express';
import {
  createExpense,
  getExpensesByGroup,
  updateExpense,
  deleteExpense,
  calculateGroupBalances,
  getExpenseById,
  splitExpenseManually,
} from '../controllers/expenseController.js';

const router = express.Router();

router.post('/', createExpense);
router.get('/group/:groupId', getExpensesByGroup);
router.get('/:expenseId', getExpenseById);
router.put('/:expenseId', updateExpense);
router.delete('/:expenseId', deleteExpense);
router.get('/group/:groupId/balances', calculateGroupBalances);
router.post('/:expenseId/split', splitExpenseManually);

export default router;
  */


/*  import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import User from '../models/User.js';

// Create a new expense
export const createExpense = async (req, res) => {
  const { groupId, description, amount, paidBy, splitAmong, splitType } = req.body;

  try {
    // Validate group existence
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Ensure all users exist in the group
    const invalidUsers = [...paidBy, ...splitAmong].filter(
      (userId) => !group.members.includes(userId)
    );
    if (invalidUsers.length > 0) {
      return res.status(400).json({ message: 'Some users are not members of the group' });
    }

    // Create the expense
    const expense = new Expense({
      groupId,
      description,
      amount,
      paidBy,
      splitAmong,
      splitType,
    });
    await expense.save();

    // Add expense to the group's expenses array
    group.expenses.push(expense._id);
    await group.save();

    res.status(201).json({ message: 'Expense created successfully', expense });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

// Get all expenses for a group
export const getExpensesByGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    const expenses = await Expense.find({ groupId }).populate('paidBy splitAmong');
    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

// Update an expense
export const updateExpense = async (req, res) => {
  const { expenseId } = req.params;
  const { description, amount, paidBy, splitAmong, splitType } = req.body;

  try {
    const expense = await Expense.findById(expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    // Update fields
    if (description) expense.description = description;
    if (amount) expense.amount = amount;
    if (paidBy) expense.paidBy = paidBy;
    if (splitAmong) expense.splitAmong = splitAmong;
    if (splitType) expense.splitType = splitType;

    await expense.save();
    res.status(200).json({ message: 'Expense updated successfully', expense });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

// Delete an expense
export const deleteExpense = async (req, res) => {
  const { expenseId } = req.params;

  try {
    const expense = await Expense.findById(expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    // Remove expense from the group's expenses array
    await Group.updateOne(
      { _id: expense.groupId },
      { $pull: { expenses: expenseId } }
    );

    // Delete the expense
    await expense.deleteOne();

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

// Calculate balances for a group
export const calculateGroupBalances = async (req, res) => {
  const { groupId } = req.params;

  try {
    const expenses = await Expense.find({ groupId });
    const balanceSheet = {};

    expenses.forEach((expense) => {
      const { amount, paidBy, splitAmong, splitType } = expense;
      const splitAmount = splitType === 'equal' ? amount / splitAmong.length : null;

      paidBy.forEach((payer) => {
        splitAmong.forEach((user) => {
          if (payer !== user) {
            if (!balanceSheet[payer]) balanceSheet[payer] = {};
            if (!balanceSheet[payer][user]) balanceSheet[payer][user] = 0;

            balanceSheet[payer][user] += splitAmount;
          }
        });
      });
    });

    res.status(200).json(balanceSheet);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

// Get expense details by ID
export const getExpenseById = async (req, res) => {
  const { expenseId } = req.params;

  try {
    const expense = await Expense.findById(expenseId).populate('paidBy splitAmong');
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    res.status(200).json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

// Split an expense manually (adjust balance)
export const splitExpenseManually = async (req, res) => {
  const { expenseId } = req.params;
  const { balances } = req.body;

  try {
    const expense = await Expense.findById(expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    // Validate balances
    if (!Array.isArray(balances) || balances.length === 0) {
      return res.status(400).json({ message: 'Balances must be a non-empty array' });
    }

    // Adjust balances (Example logic)
    balances.forEach(({ userId, amount }) => {
      // Logic to adjust user's balance based on amount
      console.log(`Adjusting balance for ${userId}: ${amount}`);
    });

    res.status(200).json({ message: 'Expense split manually', balances });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};
  */



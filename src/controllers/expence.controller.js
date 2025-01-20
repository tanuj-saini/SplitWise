

import Expense from "../models/Expense.model.js";
import Group from "../models/group.model.js";

// Helper: Validate Group Members
const validateGroupMembers = (groupMembers, userIds) => {
  return userIds.filter((userId) => !groupMembers.includes(userId));
};

// Helper: Calculate Balance and Detailed Split
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

// Create a New Expense
export const createExpense = async (req, res) => {
  const { groupId, description, amount, paidBy, splitAmong, splitType, manualSplit } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const invalidUsers = validateGroupMembers(group.members, [...paidBy, ...splitAmong]);
    if (invalidUsers.length > 0) {
      return res.status(400).json({ message: "Some users are not members of the group" });
    }

    if (splitType === "amount" && manualSplit) {
      const totalManualSplit = Object.values(manualSplit).reduce((sum, value) => sum + value, 0);
      if (totalManualSplit !== amount) {
        return res.status(400).json({ message: "Manual split amounts do not match the total expense amount" });
      }
    }

    const { balanceSheet, detailedSplit } = calculateSplits(amount, paidBy, splitAmong, splitType, manualSplit);

    const expense = new Expense({
      groupId,
      description,
      amount,
      paidBy,
      splitAmong,
      splitType,
      balanceSheet,
      detailedSplit,
    });

    await expense.save();
    group.expenses.push(expense._id);
    await group.save();

    res.status(201).json({ message: "Expense created successfully", expense });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// Get All Expenses for a Group
export const getExpensesByGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    const expenses = await Expense.find({ groupId }).populate("paidBy splitAmong");
    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// Update an Expense
export const updateExpense = async (req, res) => {
  const { expenseId } = req.params;
  const { description, amount, paidBy, splitAmong, splitType, manualSplit } = req.body;

  try {
    const expense = await Expense.findById(expenseId);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    if (description) expense.description = description;
    if (amount) expense.amount = amount;
    if (paidBy) expense.paidBy = paidBy;
    if (splitAmong) expense.splitAmong = splitAmong;
    if (splitType) expense.splitType = splitType;

    const { balanceSheet, detailedSplit } = calculateSplits(amount, paidBy, splitAmong, splitType, manualSplit);

    expense.balanceSheet = balanceSheet;
    expense.detailedSplit = detailedSplit;

    await expense.save();
    res.status(200).json({ message: "Expense updated successfully", expense });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// Delete an Expense
export const deleteExpense = async (req, res) => {
  const { expenseId } = req.params;

  try {
    const expense = await Expense.findById(expenseId);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    const group = await Group.findById(expense.groupId);
    if (group) {
      group.expenses = group.expenses.filter((id) => id.toString() !== expenseId);
      await group.save();
    }

    await expense.remove();
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};
export const calculateGroupBalances = async (req, res) => {
  const { groupId } = req.params;

  try {
    const expenses = await Expense.find({ groupId });
    if (!expenses || expenses.length === 0) {
      return res.status(404).json({ message: "No expenses found for this group" });
    }

    const balanceSheet = {};

    expenses.forEach((expense) => {
      const { amount, paidBy, splitAmong, splitType, detailedSplit } = expense;

      if (splitType === "equal") {
        // Handle equal split
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
        // Handle manual split using `detailedSplit`
        detailedSplit.forEach(({ from, to, amount }) => {
          if (!balanceSheet[to]) balanceSheet[to] = {};
          if (!balanceSheet[to][from]) balanceSheet[to][from] = 0;

          balanceSheet[to][from] += amount;
        });
      }
    });

    // Merge balances to simplify results (e.g., net out amounts between users)
    const simplifiedBalanceSheet = simplifyBalances(balanceSheet);

    res.status(200).json(simplifiedBalanceSheet);
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

// Helper function to simplify balances
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

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



import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const expenseSchema = new Schema(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    paidBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    splitAmong: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    splitType: { type: String, enum: ['equal', 'percentage', 'amount'], required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Expense = model('Expense', expenseSchema);

export default Expense;

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const balanceSchema = new Schema(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    user1: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    user2: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    balance: { type: Number, required: true },
    expenseId: { type: Schema.Types.ObjectId, ref: 'Expense' },
    paid: { type: Boolean, default: false },
    markAsPaid: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Balance = model('Balance', balanceSchema);

export default Balance;

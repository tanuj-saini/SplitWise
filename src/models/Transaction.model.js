import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const transactionSchema = new Schema(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    payer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    payee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash', 'online'], required: true },
    transactionId: { type: String },
    status: { type: String, enum: ['pending', 'completed', 'failed'], required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Transaction = model('Transaction', transactionSchema);

export default Transaction;

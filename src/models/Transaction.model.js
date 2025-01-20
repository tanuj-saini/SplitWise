import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const transactionSchema = new Schema(
  {
    groupId: { 
      type: Schema.Types.ObjectId,
       ref: 'Group', 
       required: true },
    payer: { 
      type: Schema.Types.ObjectId,
       ref: 'User',
        required: true
       },
    payee: { 
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
       },
    amount: { 
      type: Number,
      required: true
       },
   
    transactionId: {
       type: String,
     
       },
    balanceId :{
      type : Schema.Types.ObjectId,
      ref : "Balance",
      requied : true
    },
    expenseId:{
      type : Schema.Types.ObjectId,
      ref : "Expense",
      required : true
    },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed'],
       required: true },
   
  },
  { timestamps: true }
);

const Transaction = model('Transaction', transactionSchema);

export default Transaction;

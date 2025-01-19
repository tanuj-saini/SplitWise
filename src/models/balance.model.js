import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const balanceSchema = new Schema(
  {
    groupId: { 
      type: Schema.Types.ObjectId,
       ref: 'Group',
        required: true 
      },
    owner: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true
     },
    reciver: { 
      type: Schema.Types.ObjectId,
       ref: 'User', 
       required: true 
      },
    balance: { 
      type: Number, 
      required: true 
    },
    expenseId: { 
      type: Schema.Types.ObjectId,
       ref: 'Expense'
       },
    paid: { 
      type: Boolean,
       default: false
       },
    markAsPaid: {
       type: Boolean, 
       default: false 
      },
   
  },
  { timestamps: true }
);

const Balance = model('Balance', balanceSchema);

export default Balance;

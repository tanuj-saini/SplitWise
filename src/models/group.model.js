import mongoose from 'mongoose';
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const { Schema, model } = mongoose;

const groupSchema = new Schema(
  {
    name: { 
      type: String,
       required: true 
      },
    createdBy: { 
      type: Schema.Types.ObjectId,
       ref: 'User', 
       required: true
       },
    members: [
      {
       type: Schema.Types.ObjectId, 
       ref: 'User' 
      }
    ],
    expenses: [{ 
      type: Schema.Types.ObjectId,
       ref: 'Expense'
       }],
    balanceSheet: {
       type: Object,
        default: {} 
      },
  
  },
  { timestamps: true }
);

groupSchema.plugin(aggregatePaginate);

groupSchema.path('members').validate(function (members) {
  return members.length > 1;
}, 'A group must have more than one member.');

const Group = model('Group', groupSchema);

export default Group;

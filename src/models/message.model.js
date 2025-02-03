import mongoose from 'mongoose';
// import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const { Schema, model } = mongoose;

const messageSchema = new Schema(
  {
    message: { 
       type: String,
       required: true 
      },
    createdBy: { 
       type: Schema.Types.ObjectId,
       ref: 'User', 
       required: true
       },
    groupId: 
      {
       type: Schema.Types.ObjectId, 
       ref: 'Group' ,
       required: true 
      }
    
   
  
  },
  { timestamps: true }
);


const Message = model('Message', messageSchema);

export default Message;

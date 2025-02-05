import Group from "../models/group.model.js";
import  Message  from "../models/message.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import ApiResponse from "../utils/ApiResponse.js";

export const createMessageService = async (messageData) => {
    const { message, createdBy, groupId } = messageData;

    // Validate input
    if (!message || !createdBy || !groupId) {
        throw new ApiError(400, "All fields are required");
    }

    // Check group existence
    const groupExists = await Group.findById(groupId);
    if (!groupExists) {
        throw new ApiError(404, "Group not found");
    }

    // Create and save message
    const newMessage = new Message({
        message,
        createdBy,
        groupId
    });
   


    await newMessage.save();
    return newMessage;
};


// const getMessgeGroups = asyncHandler(async (req, res) => {
//     // Ensure the user is authenticated
//     if (!req.user || !req.user._id) {
//       return res.status(401).json(new ApiError(401, "Unauthorized user"));
//     }
  
// try {
//         // Extract the groupId from the request parameters or query
//         const { groupId } = req.params; // or req.query if you're using query parameters
    
//         // Validate the groupId
//         if (!groupId) {
//           return res.status(400).json(new ApiError(400, "Group ID is required"));
//         }
    
//         // Fetch messages by groupId and populate the createdBy field with user details
//         const messages = await Message.find({ groupId })
//           .populate({
//             path: 'createdBy',
//             select: 'username profilePicture phoneNumber', // Select the fields you want to include
//           })
//           .sort({ createdAt: 1 }); // Sort messages by creation time (oldest first)
    
//         // Return the messages with user details
       
//         return res
//         .status(200)
//         .json(new ApiResponse(200, messages, "Message get successfully"));

      
//     } catch (error) {
//       console.error("Error fetching groups:", error);
//       return res.status(500).json(new ApiError(500, "An error occurred while fetching groups"));
//     }
//   });
//   export { getMessgeGroups };
const getMessgeGroups = asyncHandler(async (req, res) => {
  // Ensure the user is authenticated
  if (!req.user || !req.user._id) {
    return res.status(401).json(new ApiError(401, "Unauthorized user"));
  }

  try {
      // Extract the groupId from the request parameters or query
      const { groupId } = req.params; // or req.query if you're using query parameters
  
      // Validate the groupId
      if (!groupId) {
        return res.status(400).json(new ApiError(400, "Group ID is required"));
      }

      // Extract pagination parameters from the query
      const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
      const limit = parseInt(req.query.limit) || 10; // Default to 10 messages per page if not provided


      const options = {
        page,
        limit,
        populate: {
            path: 'createdBy',
            select: 'username profilePicture phoneNumber', // Select the fields you want to include
        },
        sort: { createdAt: -1 } // Sort messages by creation time (newest first)
    };

    const result = await Message.aggregatePaginate(
        Message.aggregate([
            { $match: { groupId: new mongoose.Types.ObjectId(groupId) } }
        ]),
        options
    );

    // Return the paginated messages with user details
    return res.status(200).json(new ApiResponse(200, result, "Messages retrieved successfully"));

} catch (error) {
  console.error("Error fetching messages:", error);
  return res.status(500).json(new ApiError(500, "An error occurred while fetching messages"));
}
});

export { getMessgeGroups };
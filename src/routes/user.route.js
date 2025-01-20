//  import { Router } from 'express';
 
//  import {
//   createExpense,
//   deleteExpense,
//   getExpensesByGroup,
//   getGroupBalances,
//   markBalanceAsPaid,
//   updateExpense
// } from '../controllers/expence.controller.js';
// import { createGroup, getGroupDetails, updateGroupDetails } from '../controllers/group.controller.js';
// import { createTransaction, getTransactionById, getTransactionsByGroup, updateTransaction } from '../controllers/transition.controller.js';
// import { changePassword, getUserDetails, loginUser, logoutUser, registerUser, updateUserDetails } from '../controllers/user.controller.js';
// import { VerifyJWT } from '../middlewares/auth.middleware.js';
//  const router = Router();
 



 


// router.route("/register").post(
//   registerUser
// );
// router.route("/login").post( 
//   loginUser
// );


// //scure routes
// router.route("/logout").post(VerifyJWT,logoutUser);
// router.route("/get-user").get(VerifyJWT,getUserDetails);
// router.route("/update-details").patch(VerifyJWT,updateUserDetails);
// router.route("/change-password").post(VerifyJWT,changePassword);



// //Group routes
// router.route("/create-group").post(VerifyJWT,createGroup);
// router.route("/get-group/:groupId").get(VerifyJWT,getGroupDetails);
// router.route("/update-group/:groupId").patch(VerifyJWT,updateGroupDetails);



// //Transition Routes
// router.route('/create-transition').post(VerifyJWT,createTransaction);
// router.route('/update-transition/:transactionId').patch(VerifyJWT,updateTransaction)
// router.route('/get-transactions-groupId/:groupId').get(VerifyJWT,getTransactionsByGroup);
// router.route('/get-transactions-id/:transactionId').post(VerifyJWT,getTransactionById);

 



// // Expence routers
// //  router.route('/create-expence').post(
// //  // VerifyJWT,
// //    createExpense); 

// //   //  router.route('/getExpensesByGroup/:groupId').get(
// //   //   // VerifyJWT,
// //   //   getExpensesByGroup); 

// //     router.route('/update-expence/:expenseId').put(
// //       // VerifyJWT,
// //       updateExpense);

// //       // router.route('/groupbalance/:groupId/balances').get(
// //       //   // VerifyJWT,
// //       //   calculateGroupBalances);


// router.route('/create-expense').post(VerifyJWT, createExpense);
// router.route('/get-expenses/:groupId').get(VerifyJWT, getExpensesByGroup);
// router.route('/update-expense/:expenseId').put(VerifyJWT, updateExpense);
// router.route('/delete-expense/:expenseId').delete(VerifyJWT, deleteExpense);

// // Balance routes
// router.route('/balances/:balanceId/mark-paid').post(VerifyJWT, markBalanceAsPaid);
// router.route('/groups/:groupId/balances').get(VerifyJWT, getGroupBalances);


// export default router



// // //secure routes
// // router.route("/logout").post(VerifyJWT,logoutUser);
// // router.route("/refresh-token").post(refreshAccessToken);
// // router.route("/get-user").get(VerifyJWT,getCurrentUser);
// // router.route("/change-password").post(VerifyJWT,changePassword);
// // router.route("/update-details").patch(VerifyJWT,updateUserDetails);
// // router.route("/update-avatar").patch(VerifyJWT,upload.single('avatar'),updateUserAvatar);
// // router.route("/update-cover-image").patch(VerifyJWT,upload.single('coverImage'),updateUserCoverImage);

// // router.route("/c/:username").get(VerifyJWT,getUserChannelProfile);

// // router.route("/watch-history").get(VerifyJWT,watchHistorys);

import { Router } from 'express';
import {
  createExpense,
  deleteExpense,
  // getExpensesByGroup,
  getGroupBalances,
  markBalanceAsPaid,
  updateExpense
} from '../controllers/expence.controller.js';
import {
  createGroup,
  getGroupDetails,
  updateGroupDetails
} from '../controllers/group.controller.js';
import {
  createTransaction,
  getTransactionById,
  getTransactionsByGroup,
  updateTransaction
} from '../controllers/transition.controller.js';
import {
  changePassword,
  getUserDetails,
  loginUser,
  logoutUser,
  registerUser,
  updateUserDetails
} from '../controllers/user.controller.js';
import { VerifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Auth routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// Secure user routes
router.route("/logout").post(VerifyJWT, logoutUser);
router.route("/get-user").get(VerifyJWT, getUserDetails);
router.route("/update-details").patch(VerifyJWT, updateUserDetails);
router.route("/change-password").post(VerifyJWT, changePassword);

// Group routes
router.route("/create-group").post(VerifyJWT, createGroup);
router.route("/get-group/:groupId").get(VerifyJWT, getGroupDetails);
router.route("/update-group/:groupId").patch(VerifyJWT, updateGroupDetails);

// Transaction routes
router.route('/create-transition').post(VerifyJWT, createTransaction);
router.route('/update-transition/:transactionId').patch(VerifyJWT, updateTransaction);
router.route('/get-transactions-groupId/:groupId').get(VerifyJWT, getTransactionsByGroup);
router.route('/get-transactions-id/:transactionId').get(VerifyJWT, getTransactionById);

// Expense routes
router.route('/create-expense').post(
  //VerifyJWT, 
  
  createExpense);
//router.route('/get-expenses/:groupId').get(VerifyJWT, getExpensesByGroup);
router.route('/update-expense/:expenseId').put(
 // VerifyJWT, 
  updateExpense);
router.route('/delete-expense/:expenseId').delete(
  //VerifyJWT, 
  deleteExpense);

// Balance routes
router.route('/balances/:balanceId/mark-paid').post(
  //VerifyJWT, 
  markBalanceAsPaid);
router.route('/groups/:groupId/balances').get(
  //VerifyJWT, 
  getGroupBalances);

export default router;
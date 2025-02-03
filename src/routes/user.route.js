 import { Router } from 'express';
 
import { calculateGroupBalances, createExpense, getExpenseById, getExpensesByGroup, updateExpense } from '../controllers/expence.controller.js';
import { createGroup, getGroupDetails, updateGroupDetails ,getUserGroups,checkPhoneNumber} from '../controllers/group.controller.js';
import { createTransaction, getTransactionById, getTransactionsByGroup, updateTransaction } from '../controllers/transition.controller.js';
import { changePassword, getUserDetails, loginUser, logoutUser, registerUser, updateUserDetails } from '../controllers/user.controller.js';
import { updateBalanceSheet ,getBalanceId} from '../controllers/balance.controller.js'
import { VerifyJWT } from '../middlewares/auth.middleware.js';
import { getMessgeGroups } from '../controllers/message.controller.js';



 

 const router = Router();

 



 

//User routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);


//User scure routes
router.route("/logout").post(VerifyJWT,logoutUser);
router.route("/get-user").get(VerifyJWT,getUserDetails);
router.route("/update-details").patch(VerifyJWT,updateUserDetails);
router.route("/change-password").post(VerifyJWT,changePassword);



//Group routes
router.route("/create-group").post(VerifyJWT,createGroup);
router.route("/get-group/:groupId").get(VerifyJWT,getGroupDetails);
router.route("/update-group/:groupId").post(VerifyJWT,updateGroupDetails);
router.route("/get-group-userId").get(VerifyJWT,getUserGroups);
router.route("/check-phoneNumber").post(checkPhoneNumber)



//Transaction Routes
router.route('/create-transition').post(VerifyJWT,createTransaction);
router.route('/update-transition/:transactionId').patch(VerifyJWT,updateTransaction);
router.route('/get-transactions-groupId/:groupId').get(VerifyJWT,getTransactionsByGroup);
router.route('/get-transactions-id/:transactionId').get(VerifyJWT,getTransactionById);

 
//Balance Routes
 router.route('/update-balance').post(VerifyJWT,updateBalanceSheet);
 router.route("/getBalanceId").post(VerifyJWT,getBalanceId);

// Expence routers
 router.route('/create-expence').post(VerifyJWT,createExpense); 
 router.route('/getExpensesByGroup/:groupId').get(getExpensesByGroup); 
 router.route('/update-expence/:expenseId').put( VerifyJWT,  updateExpense);
 router.route('/groupbalance/:groupId/balances').get( VerifyJWT, calculateGroupBalances);
 router.route('/getExpenseById/:expenseId').get(VerifyJWT, getExpenseById);

 //Message routes
 router.route('/get-message/:groupId').get(VerifyJWT,getMessgeGroups);


export default router
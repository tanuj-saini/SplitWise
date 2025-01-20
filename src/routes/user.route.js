 import { Router } from 'express';
 
import { createGroup, getGroupDetails, updateGroupDetails } from '../controllers/group.controller.js';
import { changePassword, getUserDetails, loginUser, logoutUser, registerUser, updateUserDetails } from '../controllers/user.controller.js';
import { VerifyJWT } from '../middlewares/auth.middleware.js';
import { createTransaction,updateTransaction ,getTransactionsByGroup,getTransactionById} from '../controllers/transition.controller.js';
import {
  calculateGroupBalances,
  createExpense, getExpensesByGroup, updateExpense
} from '../controllers/expence.controller.js';
 const router = Router();
 



 


router.route("/register").post(
  registerUser
);
router.route("/login").post( 
  loginUser
);


//scure routes
router.route("/logout").post(VerifyJWT,logoutUser);
router.route("/get-user").get(VerifyJWT,getUserDetails);
router.route("/update-details").patch(VerifyJWT,updateUserDetails);
router.route("/change-password").post(VerifyJWT,changePassword);



//Group routes
router.route("/create-group").post(VerifyJWT,createGroup);
router.route("/get-group/:groupId").get(VerifyJWT,getGroupDetails);
router.route("/update-group/:groupId").patch(VerifyJWT,updateGroupDetails);



//Transaction Routes
router.route('/create-transition').post(VerifyJWT,createTransaction);
router.route('/update-transition/:transactionId').patch(VerifyJWT,updateTransaction);
router.route('/get-transactions-groupId/:groupId').get(VerifyJWT,getTransactionsByGroup);
router.route('/get-transactions-id/:transactionId').get(VerifyJWT,getTransactionById);

 



// Expence routers
 router.route('/create-expence').post(
 // VerifyJWT,
   createExpense); 

   router.route('/getExpensesByGroup/:groupId').get(
    // VerifyJWT,
    getExpensesByGroup); 

    router.route('/update-expence/:expenseId').put(
      // VerifyJWT,
      updateExpense);

      router.route('/groupbalance/:groupId/balances').get(
        // VerifyJWT,
        calculateGroupBalances);

export default router



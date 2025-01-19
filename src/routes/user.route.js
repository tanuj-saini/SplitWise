 import { Router } from 'express';
 
import { createGroup, getGroupDetails } from '../controllers/group.controller.js';
import { changePassword, getUserDetails, loginUser, logoutUser, registerUser, updateUserDetails } from '../controllers/user.controller.js';
import { VerifyJWT } from '../middlewares/auth.middleware.js';

import {
  createExpense,
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
 

 // Expence routers

 router.route('/create-expence').post(
 // VerifyJWT,
   createExpense); 

export default router



// //secure routes
// router.route("/logout").post(VerifyJWT,logoutUser);
// router.route("/refresh-token").post(refreshAccessToken);
// router.route("/get-user").get(VerifyJWT,getCurrentUser);
// router.route("/change-password").post(VerifyJWT,changePassword);
// router.route("/update-details").patch(VerifyJWT,updateUserDetails);
// router.route("/update-avatar").patch(VerifyJWT,upload.single('avatar'),updateUserAvatar);
// router.route("/update-cover-image").patch(VerifyJWT,upload.single('coverImage'),updateUserCoverImage);

// router.route("/c/:username").get(VerifyJWT,getUserChannelProfile);

// router.route("/watch-history").get(VerifyJWT,watchHistorys);
import { Router } from "express";
import { checkUser, forgotPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateUserProfile } from "../controllers/user.controller.js";
import { registrationValidation, loginValidation } from "../middlewares/validation.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { deleteBook, deleteUser, getAdminProfile, getAllBooks, getAllUsers, getBookCount, getUserCount, updateAdminProfile } from "../controllers/admin.controller.js"

const router = Router()

router.route('/register').post(registrationValidation, registerUser)

router.route('/login').post(loginValidation, loginUser)

//secured routes
router.route('/logout').post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/check-user").post(checkUser)

router.route("/forgotpassword").post(forgotPassword)

router.route("/getBookCount").get(verifyJWT, getBookCount)

router.route('/getUserCount').get(verifyJWT, getUserCount)

router.route('/getAllUsers').get(verifyJWT, getAllUsers)

router.route('/deleteUser/:userId').delete(verifyJWT, deleteUser)

router.route('/getAllBooks').get(verifyJWT, getAllBooks)

router.route('/deleteBook/:bookId').delete(verifyJWT, deleteBook)

router.route('/getAdminProfile').get(verifyJWT, getAdminProfile)

router.route('/updateAdminProfile/:userId').put(verifyJWT, updateAdminProfile)

router.route('/updateUserProfile/:userId').put(verifyJWT, updateUserProfile)
export default router

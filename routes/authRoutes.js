const express = require("express");
const { register, login, loggedInUser, forgotPassword, resetPassword, updateUser, updatePassword, userLogout } = require("../controllers/auth");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(userLogout);
router.route("/forgotpassword").post(forgotPassword);
router.route("/resetPassword/:token").put(resetPassword);
router.route("/me").get(protect, loggedInUser);
router.route("/update").put(protect, updateUser);
router.route("/updatepassword").put(protect, updatePassword)


module.exports = router;

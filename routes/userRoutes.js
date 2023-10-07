const express = require("express");
const { protect, authorise } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");
const User = require("../models/User");
const { getUser, getAllUsers, createUser, updateUser, deleteUser } = require("../controllers/users");
const router = express.Router();


router.use(protect);
router.use(authorise('admin'));

router.route("/user").get(advancedResults(User), getAllUsers).post(createUser);
router.route("/user/:id").get(getUser).put(updateUser).delete(deleteUser);


module.exports = router;

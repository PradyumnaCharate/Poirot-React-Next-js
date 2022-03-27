const express = require("express");
const router = express.Router();
const UserModel = require("../models/UserModel");
const FollowerModel = require("../models/FollowerModel");
const NotificationModel = require("../models/NotificationModel");
const ChatModel=require ("../models/ChatModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const isEmail = require("validator/lib/isEmail");
const authMiddleware = require("../middleware/authMiddleware");

//To verify header in request and send follow stats back
router.get("/", authMiddleware, async (req, res) => {
  const { userId } = req; 

  try {
    const user = await UserModel.findById(userId);

    const userFollowStats = await FollowerModel.findOne({ user: userId });

    return res.status(200).json({ user, userFollowStats });
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Server error`);
  }
});


//To validate login request
router.post("/", async (req, res) => {
  const { email, password } = req.body.user;

  if (!isEmail(email)) return res.status(401).send("Invalid Email");

  if (password.length < 6) {
    return res.status(401).send("Password must be atleast 6 characters");
  }

  //we have set select to false for password so here we have to specify select 

  try {
    const user = await UserModel.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );
      //user is not found with specific email
    if (!user) {
      return res.status(401).send("Invalid Email");
    }

    //comparing user password with request
    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword) {
      return res.status(401).send("Invalid Credentials");
    }
    const chatModel = await ChatModel.findOne({user:user._id})
    if(!chatModel) {
      await new ChatModel({user: user._id, chat: []}).save();
    }
      const notificationModel = await NotificationModel.findOne({user:user._id})
    if(!notificationModel) {
      await new NotificationModel({user: user._id, notifications: []}).save();
    }

    const payload = { userId: user._id };
    jwt.sign(payload, process.env.jwtSecret, { expiresIn: "2d" }, (err, token) => {
      if (err) throw err;
      res.status(200).json(token);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Server error`);
  }
});

module.exports = router;


//if existing user does not have same new Model which we have defined later then we can create that
//in this way
//const chatModel = await ChatModel.findOne({user:user._id})
//if(!chatModel) {
  //await new ChatModel({user: user._id, chat: []}).save();
//}
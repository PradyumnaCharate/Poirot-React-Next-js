const express = require("express");
const router = express.Router();
const UserModel = require("../models/UserModel");
const ProfileModel = require("../models/ProfileModel");
const FollowerModel = require("../models/FollowerModel");
const NotificationModel = require("../models/NotificationModel");
//to send back token to user
const jwt = require("jsonwebtoken");
//to encrypt password
const bcrypt = require("bcryptjs");
//validator will validate email
const isEmail = require("validator/lib/isEmail");
//if user does not provide image then we will use this image.
const userPng =
  "https://res.cloudinary.com/indersingh/image/upload/v1593464618/App/user_mklcpl.png";

const regexUserName = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;


//this router method will validate username 
router.get("/:username", async (req, res) => {
  const { username } = req.params;

  try {
    if (username.length < 2) return res.status(401).send("Invalid");

    //each expression has test method on it to validate expression

    if (!regexUserName.test(username)) return res.status(401).send("Invalid");

    const user = await UserModel.findOne({ username: username.toLowerCase() });

    if (user) return res.status(401).send("Invalid");

    return res.status(200).send("Available");
  } catch (error) {
    console.error(error);
    return res.status(500).send(`Server error`);
  }
});


//this router method will create the user
router.post("/", async (req, res) => {
  //destructure out these propertiues from user object
  const {
    name,
    email,
    username,
    password,
    bio,
    facebook,
    youtube,
    twitter,
    instagram
  } = req.body.user;
 
  if (!isEmail(email)) return res.status(401).send("Invalid Email");

  if (password.length < 6) {
    return res.status(401).send("Password must have at least 6 characters");
  }

  try {
    let user = await UserModel.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(401).send("User already registered");
    }
    //creating user
    user = new UserModel({
      name,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password,
      //profilepicurl is cloudinary url if user has uploaded any image...otherwise we will use our default image
      profilePicUrl: req.body.profilePicUrl || userPng
    });
    //encrypting passwword
    user.password = await bcrypt.hash(password, 10);
    //save user
    await user.save();

    //creating custome profileFields model and saving it to Profile of user by adding user info 
    let profileFields = {};
    profileFields.user = user._id;

    profileFields.bio = bio;

    profileFields.social = {};
    if (facebook) profileFields.social.facebook = facebook;
    if (youtube) profileFields.social.youtube = youtube;
    if (instagram) profileFields.social.instagram = instagram;
    if (twitter) profileFields.social.twitter = twitter;
    
    //saving profile object to profile model
    await new ProfileModel(profileFields).save();
    //initializing followers and following to empty array 
    await new FollowerModel({ user: user._id, followers: [], following: [] }).save();

    await new NotificationModel({user: user._id, notifications: []}).save();

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

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FollowerSchema = new mongoose.Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },

  //followers of users will be array and each field will be of user object
  followers: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" }
    }
  ],

  //following also will be the same type of user array

  following: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" }
    }
  ]
});

module.exports = mongoose.model("Follower", FollowerSchema);

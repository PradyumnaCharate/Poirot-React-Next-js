const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: { type: String, required: true,minlength:2 },

    email: { type: String, required: true, unique: true },
    //whenever user object is searched in database password field will no be selected by default because
    //we have set select to false

    password: { type: String, required: true, select: false },
    //if there are any spaces it will be automatically trimmed 
 
    username: { type: String, required: true, unique: true, trim: true },

    profilePicUrl: { type: String },

    newMessagePopup: { type: Boolean, default: true },

    unreadMessage: { type: Boolean, default: false },

    unreadNotification: { type: Boolean, default: false },
    //enum tells that there can be maximum two values for this field user and root
    role: { type: String, default: "user", enum: ["user", "root"] },

    resetToken: { type: String },

    expireToken: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);

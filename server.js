const express = require("express");
const app = express();
const server = require("http").Server(app);
const next = require("next");
const io = require("socket.io")(server);
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
require("dotenv").config({ path: "./.env" });
const connectDb = require("./serverUtils/databaseConnection");
const { addUser, removeUser, findConnectedUser } = require("./serverUtils/roomActions");
const {
  loadMessages,
  sendMsg,
  setMsgToUnread,
  deleteMsg
} = require("./serverUtils/messageActions");
const { likeOrUnlikePost } = require("./serverUtils/likeOrUnlikePost");
connectDb();
app.use(express.json());
const PORT = process.env.PORT || 3000;

//when frontend socket io client makes initial connection this 1 st argument connection is generated
//socket means client who is connected
io.on("connection", socket => {
  //join is event at frontend
  //socket.emmit is used to send the data 
  //socket.on is used to recieve the data or listen to event 
  //so we are adding that user id and socket.id to users list which is coonnected to appp
  //socket id is generated automatically by socket io each time for new connection 
  socket.on("join", async ({ userId }) => {
    //addUser is in roomaction.js
    const users = await addUser(userId, socket.id);
    console.log(users);

    setInterval(() => {
      socket.emit("connectedUsers", {
        //we are sending back all logged in users other than this user after every 10 seconds 
        users: users.filter(user => user.userId !== userId)
      });
    }, 10000);
  });

  //load messages   
  //loadmessages is in messageaction.js
  socket.on("loadMessages", async ({ userId, messagesWith }) => {
    const { chat, error } = await loadMessages(userId, messagesWith);
    //if chats are found send chats event to frontend otherwise send nochat found event
    !error ? socket.emit("messagesLoaded", { chat }) : socket.emit("noChatFound");
  });

  socket.on("sendNewMsg", async ({ userId, msgSendToUserId, msg }) => {
    const { newMsg, error } = await sendMsg(userId, msgSendToUserId, msg);
    
    //here when receiver user is online is being checked 
    const receiverSocket = findConnectedUser(msgSendToUserId);

    if (receiverSocket) {
      // WHEN YOU WANT TO SEND MESSAGE TO A PARTICULAR SOCKET
      //only to that particular socket where user is logged in
      io.to(receiverSocket.socketId).emit("newMsgReceived", { newMsg });
    }
    //messageactin to set unread messages to new msg
    else {
      await setMsgToUnread(msgSendToUserId);
    }

    !error && socket.emit("msgSent", { newMsg });
  });

  socket.on("deleteMsg", async ({ userId, messagesWith, messageId }) => {
    const { success } = await deleteMsg(userId, messagesWith, messageId);

    if (success) socket.emit("msgDeleted");
  });
  socket.on("likePost", async ({ postId, userId, like }) => {
    const {
      success,
      name,
      profilePicUrl,
      username,
      postByUserId,
      error
    } = await likeOrUnlikePost(postId, userId, like);

    if (success) {
      socket.emit("postLiked");

      if (postByUserId !== userId) {
        const receiverSocket = findConnectedUser(postByUserId);

        if (receiverSocket && like) {
          // WHEN YOU WANT TO SEND DATA TO ONE PARTICULAR CLIENT
          io.to(receiverSocket.socketId).emit("newNotificationReceived", {
            name,
            profilePicUrl,
            username,
            postId
          });
        }
      }
    }
  });

  socket.on("sendMsgFromNotification", async ({ userId, msgSendToUserId, msg }) => {
    const { newMsg, error } = await sendMsg(userId, msgSendToUserId, msg);
    const receiverSocket = findConnectedUser(msgSendToUserId);

    if (receiverSocket) {
      // WHEN YOU WANT TO SEND MESSAGE TO A PARTICULAR SOCKET
      io.to(receiverSocket.socketId).emit("newMsgReceived", { newMsg });
    }
    //
    else {
      await setMsgToUnread(msgSendToUserId);
    }

    !error && socket.emit("msgSentFromNotification");
  });

  socket.on("dis-connect", () => removeUser(socket.id));
});


nextApp.prepare().then(() => {

  //routers for signup and login
  app.use("/api/signup", require("./api/signup"));
  app.use("/api/auth", require("./api/auth"));
  app.use('/api/search',require("./api/search"));
  app.use("/api/posts",require('./api/posts'));
  app.use("/api/profile",require('./api/profile'));
  app.use("/api/notifications",require("./api/notifications"));
  app.use("/api/chats", require("./api/chats"));
  app.use("/api/reset", require("./api/reset"));

  //because Nextjs pages are created at server (Server side rendering) we must do this
  app.all("*", (req, res) => handle(req, res));

  server.listen(PORT, err => {
    if (err) throw err;
    console.log("Express server running");
  });
});

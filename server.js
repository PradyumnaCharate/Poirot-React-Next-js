const express = require("express");
const app = express();
const server = require("http").Server(app);
const next = require("next");
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
require("dotenv").config({ path: "./.env" });
const connectDb = require("./serverUtils/databaseConnection");
connectDb();
console.log("pdsssssssssssssssss")
app.use(express.json());
const PORT = process.env.PORT || 3000;

nextApp.prepare().then(() => {

  //routers for signup and login
  app.use("/api/signup", require("./api/signup"));
  app.use("/api/auth", require("./api/auth"));
  app.use('/api/search',require("./api/search"))
  app.use("/api/posts",require('./api/posts'))

  //because Nextjs pages are created at server (Server side rendering) we must do this
  app.all("*", (req, res) => handle(req, res));

  server.listen(PORT, err => {
    if (err) throw err;
    console.log("Express server running");
  });
});

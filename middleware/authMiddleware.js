const jwt = require("jsonwebtoken");


//middlewares which we use in api methods will always have neext so that response is carried to next  
module.exports = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).send(`Unauthorized`);
    }

    //here we are destrucring out userId because from the backend we send userId as payload to token in auth.js
    const { userId } = jwt.verify(req.headers.authorization, process.env.jwtSecret);

    req.userId = userId;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).send(`Unauthorized`);
  }
};

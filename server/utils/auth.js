const jwt = require("jsonwebtoken");

// set token secret and expiration date
const secret = "mysecretsshhhhh";
const expiration = "2h";

module.exports = {
  // function for our authenticated routes
  authMiddleware: function ({ req }) {
    // allows token to be sent via  req.body or query or headers
    let token = req.body.token || req.query.token || req.headers.authorization;
    console.log("AUTH MIDDLEWARE 1");
    // ["Bearer", "<tokenvalue>"]
    if (req.headers.authorization) {
      token = token.split(" ").pop().trim();
    }
    console.log("AUTH MIDDLEWARE 2");

    if (!token) {
      // return res.status(400).json({ message: 'You have no token!' });
      return req;
    }
    console.log("AUTH MIDDLEWARE 3");

    // verify token and get user data out of it
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
      console.log("REQUEST USER?", req.user);
      console.log("AUTH MIDDLEWARE4");

    } catch {
      console.log("Invalid token");
      console.log("AUTH MIDDLEWARE 5");

      // return res.status(400).json({ message: 'invalid token!' });
    }

    // // send to next endpoint
    // next();
    console.log("AUTH MIDDLEWARE 6");

    // return the request object so it can be passed to the resolver as `context`
    return req;
  },
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};

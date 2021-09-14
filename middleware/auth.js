module.exports = async (req, res, next) => {
  const jwt = require("jsonwebtoken");
  const bcrypt = require("bcrypt");
  const Users = require("./../models/users");
  const SECRET_KEY = "0d2a3f$½{[]}99885def98a½f76$DGHAbgts$½{[]}dgce0c";
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;

    jwt.verify(req.token, SECRET_KEY, (err, decoded) => {
      if (err) {
        res.sendStatus(403);
        req.authInfo = null;
      } else if (decoded.pass_12 && decoded.userId) {
        Users.findById(decoded.userId, (err, user) => {
          if (
            !bcrypt.compareSync(user.password.substr(0, 12), decoded.pass_12)
          ) {
            res.sendStatus(403);
            req.authInfo = null;
          } else {
            req.authInfo = {
              email: user.email,
              name: user.name,
              username: user.username,
            };
            next();
          }
        });
      }
    });
  } else {
    res.sendStatus(403);
  }
};

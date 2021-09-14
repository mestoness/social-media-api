const app = require("express").Router();
const Users = require("./../models/users");
const AuthMiddleware = require("./../middleware/auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "0d2a3f$½{[]}99885def98a½f76$DGHAbgts$½{[]}dgce0c";
const CaptchaMiddleware = require("./../middleware/capthca");

app.post("/auth/signup", CaptchaMiddleware, async (req, res) => {
  const newUser = new Users({
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
    name: req.body.name,
    username: req.body.username,
  });

  newUser.save(function (err) {
    if (err) {
      if (err.name === "MongoError" && err.code === 11000) {
        return res
          .status(422)
          .send({ succes: false, message: "User already exist!" });
      }
      return res.status(422).send(err);
    } else {
      res.json({
        success: true,
      });
    }
  });
});
app.post("/auth/login", CaptchaMiddleware, async (req, res) => {
  Users.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      res.json(err);
    } else {
      if (user) {
        if (!bcrypt.compareSync(req.body.password, user.password)) {
          return res.status(401).json({
            login: "İnvalid User",
          });
        } else {
          let token = jwt.sign(
            {
              userId: user._id,
              pass_12: bcrypt.hashSync(user.password.substr(0, 12), 10),
            },
            SECRET_KEY,
            {
              expiresIn: "1h",
            }
          );
          res.status(200).json({
            login: "true",
            token: token,
          });
        }
      } else {
        return res.status(401).json({
          login: "İnvalid User",
        });
      }
    }
  });
});
app.get("/auth/info", AuthMiddleware, (req, res) => {
  if (!req.authInfo) {
    return res.status(401).json({
      token_status: "unauthorized",
    });
  } else {
    res.json({ data: req.authInfo });
  }
});
app.get("/auth/logout", (req, res) => {
  res.json({});
});

module.exports = app;

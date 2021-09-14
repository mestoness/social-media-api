const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3001;
const Post = require("./models/post");
const userRouter = require("./router/userRouter");
const Users = require("./models/users");
const AuthMiddleware = require("./middleware/auth");
const ObjectId = mongoose.Types.ObjectId;
const CaptchaMiddleware = require("./middleware/capthca");

app.use(
  cors({
    origin: "*",
  })
);
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
mongoose.connect(
  "mongodb://localhost:27017/mest?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false",
  { useUnifiedTopology: true, useNewUrlParser: true }
);
mongoose.connection.on("open", () => {
  console.log("MongoDB: Connected");
});
mongoose.connection.on("error", (err) => {
  console.log("MongoDB: Error", err);
});
mongoose.set("useFindAndModify", false);
mongoose.set("useNewUrlParser", true);
mongoose.set("useCreateIndex", true);
app.use(userRouter);

app.post(
  "/post/create",
  [AuthMiddleware, CaptchaMiddleware],
  async (req, res) => {
    if (req.body.content && req.authInfo.username) {
      const newPost = new Post({
        ownerUsername: req.authInfo.username,
        content: req.body.content,
        ownerName: req.authInfo.name,
      });
      newPost.save((err, newPost) => {
        if (err) {
          res.json(err);
        } else if (newPost) {
          res.json({...newPost._doc,success:true});
        } else {
          res.json({});
        }
      });
    } else {
      res.status(500).json({});
    }
  }
);

app.put("/post/like/:id", AuthMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      if (!post.likes.includes(req.authInfo.username)) {
        await post.updateOne({
          $push: { likes: req.authInfo.username },
          $inc: { likeCount: 1 },
        });
        res.status(200).json({
          status: true,
          message: "The post has been liked",
        });
      } else {
        await post.updateOne({
          $pull: { likes: req.authInfo.username },
          $inc: { likeCount: -1 },
        });
        res
          .status(200)
          .json({ status: true, message: "The post has been disliked" });
      }
    } else {
      res.json({ message: "post invalid" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
app.get("/post/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});
app.get("/timeline", AuthMiddleware, async (req, res) => {
  Users.findOne({ username: req.authInfo.username }, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      let timeLıne = Post.find(
        {
          ownerUsername: { $in: [...result.following, req.authInfo.username] },
        },
        { likes: { $slice: [0, 20] } }
      )
        .sort({ createdAt: -1 })
        .limit(10);
      timeLıne.exec((err, posts) => {
        res.json(posts);
      });
    }
  });
});
app.get("/user/posts/:username", (req, res) => {
  Post.find({ ownerUsername: req.params.username }, (err, posts) => {
    if (err) {
      console.log(err);
    } else if (posts) {
      res.json(posts);
    } else {
      res.json([{}]);
    }
  });
});
// app.get("/test", AuthMiddleware, async (req, res) => {
//   Users.aggregate(
//     [
//       {
//         $match: {
//           _id: ObjectId("611a5e6ecfd7fc5608dab02a"),
//         },
//       },
//       { $project: { count: { $size: "$following" } } },
//     ],
//     (error, data) => {
//       if (error) {
//         console.log(error);
//       } else {
//         res.json(data);
//       }
//     }
//   );
// });
app.listen(port, (err) => {
  if (err) return console.log(err);
  console.log("http://localhost:" + port);
});

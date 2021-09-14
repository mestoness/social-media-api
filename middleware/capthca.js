module.exports = async (req, res, next) => {
  const axios = require("axios");
  var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  axios
    .get(
      `https://www.google.com/recaptcha/api/siteverify?secret=6LfJAAgcAAAAAP2Yeqzngb1K_iK7m46YjpsSAPgY&response=${req.body.captcha}`
    )
    .then((response) => {
      if (response.data.success == true) {
        next();
      } else {
        res.status(403),
          json({
            captcha: "invalid",
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

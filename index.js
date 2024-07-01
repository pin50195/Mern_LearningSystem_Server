const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const authRoute = require("./routes").auth;
const courseRoute = require("./routes").course;
const passport = require("passport");
require("./config/passport")(passport);
const cors = require("cors");
const mongoURI = process.env.MONGO_URI;
const port = process.env.port || 5050;

//連線MongoDB
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("已成功連線mongodb");
  })
  .catch((e) => {
    console.log(e);
  });

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/api/user", authRoute);

//只有登入系統才能註冊或新增課程(jwt)
app.use(
  "/api/courses",
  passport.authenticate("jwt", { session: false }),
  courseRoute
);

app.listen(port, () => {
  console.log(`後端伺服器port ${port}運行中`);
});

const router = require("express").Router();
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;
const User = require("../models").user;
const jwt = require("jsonwebtoken");

router.use((req, res, next) => {
  console.log("正在接收一個跟auth有關的請求");
  next();
});

router.post("/register", async (req, res) => {
  //確認註冊資料是否符合規範
  let { error } = registerValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  //確認信箱是否已註冊
  let { userName, email, password, role, date, courses } = req.body;
  let check_Email = await User.findOne({ email }).exec();
  if (check_Email) {
    return res.status(400).send("E-mail has been registered.");
  }

  //前面兩項確認完,可註冊新用戶

  let newUser = new User({
    userName,
    email,
    password,
    role,
    date,
    courses,
  });

  try {
    let save_NewUser = await newUser.save();
    return res.send({ message: "Success", save_NewUser });
  } catch (e) {
    return res.status(500).send("Unable to save user.");
  }
});

router.post("/login", async (req, res) => {
  //確認登入資料是否符合規範
  let { error } = loginValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  //確認信箱是否已註冊
  let { email, password } = req.body;
  let found_User = await User.findOne({ email }).exec();
  if (!found_User) {
    return res.status(401).send("E-mail hasn't been registered yet.");
  }

  found_User.comparePassword(password, (err, isMatch) => {
    if (err) return res.status(500).send(err);
    if (isMatch) {
      const token_Object = { _id: found_User._id, email: found_User.email };
      const token = jwt.sign(token_Object, process.env.PASSPORT_SECRECT);
      return res.send({
        message: "Success",
        jwt_Token: "JWT " + token,
        found_User,
      });
    } else {
      return res.status(401).send("Password Error");
    }
  });
});

module.exports = router;

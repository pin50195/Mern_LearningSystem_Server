const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, min: 8, required: true },
  role: { type: String, enum: ["Instructor", "Student"], required: true },
  date: { type: Date, default: Date.now },
});

// instance method
userSchema.methods.isInstructor = function () {
  return this.role == "Instructor";
};

userSchema.methods.isStudent = function () {
  return this.role == "Student";
};

userSchema.methods.comparePassword = async function (password, cb) {
  let result;
  try {
    result = await bcrypt.compare(password, this.password);
    return cb(null, result);
  } catch (e) {
    return cb(e, result);
  }
};

// mongoose middleware
// 若使用者為新用戶或正在修改密碼，則將密碼進行雜湊
userSchema.pre("save", async function (next) {
  // this 代表mongoDB 內的 Document

  if (this.isNew || this.isModified(this.password)) {
    const hashValue = await bcrypt.hash(this.password, 10);
    this.password = hashValue;
  }

  next();
});

module.exports = mongoose.model("User", userSchema);

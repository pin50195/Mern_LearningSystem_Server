const mongoose = require("mongoose");
const { Schema } = mongoose;

const courseSchema = new Schema({
  title: { type: String, min: 5, max: 50, require: true },
  description: { type: String, min: 5, max: 50, require: true },
  hour: { type: Number, require: true },
  price: { type: Number, require: true },
  pictureTitle: { type: String },
  picture: {
    data: Buffer,
    contentType: String,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("Course", courseSchema);

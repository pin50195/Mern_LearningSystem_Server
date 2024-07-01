const router = require("express").Router();
const courseValidation = require("../validation").courseValidation;
const Course = require("../models").course;

// 上傳照片
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 限制 2 MB
  },
}).single("picture");

const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading.
    if (err.code === "LIMIT_FILE_SIZE") {
      console.log(err);
      return res.status(400).send("File size is too large. Max limit is 2MB.");
    }
    return res.status(400).send(err.message);
  } else if (err) {
    // An unknown error occurred when uploading.
    return res.status(500).send(err.message);
  }
  // Everything went fine.
  next();
};

router.use((req, res, next) => {
  console.log("正在course Router中");
  next();
});

//講師新增課程
router.post(
  "/",
  (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        return multerErrorHandler(err, req, res, next);
      }
      next();
    });
  },
  async (req, res) => {
    //確認是否符合規範
    let { error } = courseValidation(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    if (req.user.isStudent()) {
      return res.status(400).send("學生無法新增課程");
    }
    let { title, description, hour, price, pictureTitle } = req.body;

    let picture = req.file
      ? {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        }
      : null;

    try {
      let newCourse = new Course({
        title,
        description,
        hour,
        price,
        pictureTitle,
        picture,
        instructor: req.user._id,
      });
      await newCourse.save();
      return res.send("成功新增課程");
    } catch (e) {
      return res.status(500).send(e);
    }
  }
);

//講師修改課程
router.patch(
  "/:_id",
  (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        return multerErrorHandler(err, req, res, next);
      }
      next();
    });
  },
  async (req, res) => {
    //確認課程是否存在
    let { _id } = req.params;
    let { title, description, hour, price, pictureTitle } = req.body;
    let editCourse;

    try {
      let find_idCourse = await Course.findOne({ _id });
      console.log(find_idCourse);
      if (!find_idCourse) {
        return res.status(400).send("無此課程，請重新查詢");
      } else {
        //確定更新的項目

        if (!title) {
          title = find_idCourse.title;
        }
        if (!description) {
          description = find_idCourse.description;
        }
        if (hour == 0) {
          hour = find_idCourse.hour;
        }
        if (price == 0) {
          price = find_idCourse.price;
        }
        if (!pictureTitle) {
          pictureTitle = find_idCourse.pictureTitle;
        }

        let picture;
        if (req.file) {
          picture = {
            data: req.file.buffer,
            contentType: req.file.mimetype,
          };
        } else {
          picture = find_idCourse.picture;
        }

        editCourse = {
          title,
          description,
          hour,
          price,
          pictureTitle,
          picture,
        };
      }

      //驗證數據符合規範
      let { error } = courseValidation(editCourse);
      if (error) {
        return res.status(400).send(error.details[0].message);
      }
      //更新課程,使用者必須是此課程講師
      if (find_idCourse.instructor.equals(req.user._id)) {
        let update_idCourse = await Course.findOneAndUpdate(
          { _id },
          editCourse,
          {
            runValidators: true,
            new: true,
          }
        ).exec();
        return res.send({ message: "Modified Success", update_idCourse });
      } else {
        return res
          .status(403)
          .send("Only the instructor of this course can modify");
      }
    } catch (e) {
      return res.status(400).send({ e });
    }
  }
);

//講師刪除課程
router.delete("/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let foundCourse = await Course.findOne({ _id })
      .populate("instructor", ["userName", "email"])
      .exec();
    let deleteCourse = await Course.deleteOne({ _id }).exec();
    return res.send(foundCourse);
  } catch (e) {
    return res.status(400).send(e);
  }
});

//學生註冊課程
router.post("/enroll/:_id", async (req, res) => {
  let { _id } = req.params;

  try {
    let foundCourse = await Course.findOne({ _id }).exec();
    let isStudentEnrolled = foundCourse.students.includes(req.user._id);

    if (isStudentEnrolled) {
      return res.send({ msg: "You've already registered for this course." });
    } else {
      foundCourse.students.push(req.user._id);
      await foundCourse.save();
      return res.send({ msg: "", foundCourse });
    }
  } catch (e) {
    return res.status(500).send(e);
  }
});

//找到全部課程
router.get("/", async (req, res) => {
  try {
    let findCourses = await Course.find({})
      .populate("instructor", ["userName", "email"])
      .exec();
    return res.send(findCourses);
  } catch (e) {
    return res.status(500).send(e);
  }
});

//使用"課程id"找到課程
router.get("/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let foundCourses = await Course.findOne({ _id })
      .populate("instructor", ["userName", "email"])
      .exec();

    return res.send(foundCourses);
  } catch (e) {
    return res.status(500).send(e);
  }
});

//使用"課程名稱"找到課程
router.get("/findByName/:name", async (req, res) => {
  let { name } = req.params;
  try {
    let foundCourses = await Course.find({ title: name })
      .populate("instructor", ["userName", "email"])
      .exec();
    return res.send(foundCourses);
  } catch (e) {
    return res.status(500).send(e);
  }
});

//使用"講師id"找到講師已開設課程
router.get("/instructor/:_instructor_id", async (req, res) => {
  let { _instructor_id } = req.params;
  try {
    let foundCourses = await Course.find({ instructor: _instructor_id })
      .populate("instructor", ["userName", "email"])
      .exec();

    return res.send(foundCourses);
  } catch (e) {
    return res.status(500).send(e);
  }
});

//使用"學生id"找到學生已註冊課程
router.get("/student/:_student_id", async (req, res) => {
  let { _student_id } = req.params;
  try {
    let foundCourses = await Course.find({ students: _student_id })
      .populate("instructor", ["userName", "email"])
      .exec();

    return res.send(foundCourses);
  } catch (e) {
    return res.status(500).send(e);
  }
});

module.exports = router;

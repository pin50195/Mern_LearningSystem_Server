const Joi = require("joi");

// joi 使錯誤訊息更容易讓使用者了解

const registerValidation = (data) => {
  const schema = Joi.object({
    userName: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid("Instructor", "Student").required(),
  });

  return schema.validate(data);
};

const courseValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(5).max(50).required(),
    description: Joi.string().min(5).max(50).required(),
    hour: Joi.number().min(1).max(100).required(),
    price: Joi.number().min(10).max(20000).required(),
    pictureTitle: Joi.string().required(),
    picture: Joi.object({
      data: Joi.binary().required(),
      contentType: Joi.string().required(),
    }),
  });
  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  });
  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.courseValidation = courseValidation;
module.exports.loginValidation = loginValidation;

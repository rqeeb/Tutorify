const { Router } = require("express");
const Router = Router();
const { adminModel } = require("../db.js");
const { courseModel } = require("../db.js");
const jwt = require("jsonwebtoken");
const JWT_ADMIN_PASSWORD = process.env.JWT_ADMIN_PASSWORD;
const { adminMiddleware } = require("../middleware/admin.js");

adminRouter.post("/signup", async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  //Hash Password here!: No need [Admin Panel]

  try {
    await adminModel.create({
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
    });

    res.status(200).json({
      message: "signup suceed",
    });
  } catch (e) {
    res.status(500).json({
      error: e.message || e,
    });
  }
});

adminRouter.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  //Password in DB is hashed but user provided NOT HASHED version - so UNHASH & compare.

  const adminExists = await adminModel.findOne({
    email: email,
    password: password,
  });

  if (adminExists) {
    const token = jwt.sign(
      {
        id: adminExists._id,
      },
      JWT_ADMIN_PASSWORD,
    );
    res.status(200).json({
      token: token,
    });
  } else {
    res.status(403).json({
      message: "Invalid credentials",
    });
  }
});

adminRouter.post("/course", adminMiddleware, async (req, res) => {
  const adminId = req.userId;

  const { title, description, imageUrl, price } = req.body;

  const course = await courseModel.create({
    title: title,
    description: description,
    imageUrl: imageUrl,
    price: price,
    creatorId: adminId,
  });

  res.json({
    message: "Course create",
    courseId: course._id,
  });
});

//to update a course!
adminRouter.put("/course", async (req, res) => {
  try {
    const adminId = req.userId;
    const { title, description, imageUrl, price, courseId } = req.body;

    const course = await courseModel.findOne({
      _id: courseId,
      creatorId: adminId,
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found or unauthorized",
      });
    }

    course.title = title;
    course.description = description;
    course.imageUrl = imageUrl;
    course.price = price;

    await course.save();

    res.json({
      message: "Course updated successfully",
      courseId: course._id,
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
});

adminRouter.get("/course/bulk", adminMiddleware, async (req, res) => {
  const adminId = req.userId;

  const courses = await courseModel.find({
    creatorId: adminId,
  });

  res.json({
    message: "returned all courses",
    courses: courses,
  });
});

module.exports = {
  adminRouter: adminRouter,
};

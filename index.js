const express = require("express");
const app = express();
const {userRouter} = require("./routes/user.js");
const {courseRouter} = require("./routes/course.js");

app.use("/user",userRouter)
app.use("/course",courseRouter)


app.listen(2346);
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

dotenv.config({ path: "config/config.dev" });

const boorcampsRoute = require("./routes/bootcampsRoutes");
const coursesRoute = require("./routes/coursesRoutes");
const authRoute = require("./routes/authRoutes");
const userRoute = require("./routes/userRoutes");
const reviewRoute = require("./routes/reviewRoutes");
const errorHandler = require("./middleware/error");
const rateLimit = require('express-rate-limit');

//connection
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
connectDB();

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//cookie parser
app.use(cookieParser())

//sanetise for nosql injection
app.use(mongoSanitize());

//for seurity header
app.use(helmet());

//for xss attccks
app.use(xss());

//for http parameter polution
app.use(hpp());

//for cors
app.use(cors());

//rate limiting
app.use(rateLimit(
  {
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)  
  }
))




// app.use()
//routing

app.use("/api/v1/bootcamps", boorcampsRoute);
app.use("/api/v1/courses", coursesRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/admin", userRoute);
app.use("/api/v1/reviews", reviewRoute);
app.use("/", function(req, res){
  res.sendFile(path.join(__dirname+'/public/index.html'))
});
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log("run");
});

//handle rejection
process.on("unHandledRejection", (err, promise) => {
  console.log("Error:", err.message);

  server.close(() => {
    process.exit(1);
  });
});

const express = require("express");
const app = express();
//routes
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const recipeRoutes = require("./routes/recipe");
const postRoutes = require("./routes/post");
const mongoose = require("mongoose");
const http = require("http");
const generateResponse = require("./helper/generateResponse");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

//express middleware for parsing requests
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//mount the routes
app.use(morgan("dev"));
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/recipes", recipeRoutes);
app.use("/posts", postRoutes);
app.use(function (req, res, next) {
  return generateResponse(res, 404);
});

//connect to mongo database
mongoose
  .connect(process.env.DB_URL, {
    dbName: "CookingCart",
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Connected to database");
  });

//listen on port 4000
var port = "4000";
var server = http.createServer(app);
server.listen(port, (err) => {
  if (err) throw err;
  console.log("Server listening on port", port);
});

module.exports = app;

const jwt = require("jsonwebtoken");
const generateResponse = require("../helper/generateResponse");
require("dotenv").config();

exports.validateToken = async function (req, res, next) {
  const token = req.headers["authorization"];
  if (!token) {
    return generateResponse(res, 401, {}, "No token found, please login first");
  }
  try {
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    next();
  } catch (err) {
    return generateResponse(res, 401, {}, "Invalid Token");
  }
};

const jwt = require('jsonwebtoken');
const generateResponse = require('../helper/generateResponse');
require('dotenv').config();

exports.validateToken = async function (req, res, next) {
  console.log('validating the token');
  const token = req.headers['authorization'];
  console.log('Token: ', token);
  if (!token) {
    return generateResponse(res, 401, {}, 'No token found, please login first');
  }
  try {
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    next();
  } catch (err) {
    return generateResponse(res, 401, {}, 'Invalid Token');
  }
};

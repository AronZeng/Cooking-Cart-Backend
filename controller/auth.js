const bcrypt = require('bcrypt');
const User = require('../model/user');
const Token = require('../model/token');
const jwt = require('jsonwebtoken');
const generateResponse = require('../helper/generateResponse');
require('dotenv').config();

exports.login = async function (req, res, next) {
  try {
    const user = await User.findOne({ username: req.body.username });
    bcrypt.compare(
      req.body.password,
      user.password,
      async function (err, result) {
        if (result) {
          try {
            const token = jwt.sign(
              { userId: user._id },
              process.env.TOKEN_SECRET,
              { expiresIn: '10h' }
            );
            await Token.create({
              user: user._id,
              token: token,
            });
            return generateResponse(res, 200, { token: token, user: user });
          } catch (err) {
            res.status(500);
          }
        } else {
          return generateResponse(res, 401, {}, 'Invalid Login');
        }
      }
    );
  } catch (err) {
    return generateResponse(res, 500);
  }
};

exports.logout = async function (req, res, next) {
  try {
    const user = await User.findOne({
      _id: jwt.decode(req.headers['authorization']).userId,
    });
    //return unauthorized if the user is trying to lo
    if (!user) {
      return generateResponse(res, 401);
    }
    await Token.findOneAndRemove({
      user: user._id,
      token: req.headers['authorization'],
    });
    return generateResponse(res, 200);
  } catch (err) {
    return generateResponse(res, 500);
  }
};

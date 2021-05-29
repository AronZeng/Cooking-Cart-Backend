const User = require('../model/user');
const bcrypt = require('bcrypt');
const generateResponse = require('../helper/generateResponse');

exports.readOne = async function (req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    return generateResponse(res, 200, user);
  } catch (err) {
    return generateResponse(res, 500);
  }
};

exports.create = async function (req, res, next) {
  bcrypt.hash(req.body.password, 10, async function (err, hash) {
    try {
      const newUser = {
        username: req.body.username,
        password: hash,
        email: req.body.email,
      };
      const savedUser = await User.create(newUser);
      return generateResponse(res, 201, savedUser);
    } catch (err) {
      return generateResponse(res, 500);
    }
  });
};

exports.update = async function (req, res, next) {
  try {
    console.log(req.body);
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    console.log(user);
    return generateResponse(res, 200, user);
  } catch (err) {
    return generateResponse(res, 500);
  }
};

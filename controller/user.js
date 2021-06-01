const User = require("../model/user");
const bcrypt = require("bcrypt");
const generateResponse = require("../helper/generateResponse");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");

exports.readOne = async function (req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    return generateResponse(res, 200, user);
  } catch (err) {
    return generateResponse(res, 500);
  }
};

exports.readMany = async function (req, res, next) {
  let limit = parseInt(req.query.limit) || 10;
  let skip = req.query.page ? limit * (parseInt(req.query.page) - 1) : 0;
  try {
    let filters = [];
    if (req.query.search) {
      filters.push({
        email: { $regex: req.query.search, $options: "i" },
      });
      filters.push({
        username: { $regex: req.query.search, $options: "i" },
      });
    }
    const query = filters.length ? { $or: filters } : {};
    const users = await User.find(query).skip(skip).limit(limit);
    const count = await User.find(query).count();
    return generateResponse(res, 200, { users: users, count: count });
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
      console.log(err);
      return generateResponse(res, 500);
    }
  });
};

exports.update = async function (req, res, next) {
  try {
    const userId = jwt.decode(req.headers["authorization"]).userId;
    if (userId.toString() != req.params.id.toString()) {
      return generateResponse(res, 401);
    }
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    return generateResponse(res, 200, user);
  } catch (err) {
    return generateResponse(res, 500);
  }
};

exports.groceryList = async function (req, res, next) {
  try {
    const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
    const userId = await jwt.decode(req.headers["authorization"]).userId;
    const user = await User.findById(userId);
    await client.messages.create({
      body: req.body.text,
      to: user.phoneNumber, // Text this number
      from: process.env.TWILIO_NUMBER, // From a valid Twilio number
    });

    return generateResponse(res, 200);
  } catch (err) {
    console.log(err);
    return generateResponse(res, 500);
  }
};

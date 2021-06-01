const Post = require("../model/post");
const generateResponse = require("../helper/generateResponse");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.readOne = async function (req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    return generateResponse(res, 200, post);
  } catch (err) {
    return generateResponse(res, 500);
  }
};

exports.readMany = async function (req, res, next) {
  let limit = parseInt(req.query.limit) || 10;
  let skip = req.query.page ? limit * (parseInt(req.query.page) - 1) : 0;
  try {
    const posts = await Post.find({ isDeleted: false }).skip(skip).limit(limit);
    const count = await Post.find({ isDeleted: false }).count();
    return generateResponse(res, 200, { posts: posts, count: count });
  } catch (err) {
    return generateResponse(res, 500);
  }
};

exports.create = async function (req, res, next) {
  try {
    const userId = await jwt.decode(req.headers["authorization"]).userId;
    const imageUrl = req.file ? req.file.location : null;
    const post = await Post.create({
      user: userId,
      images: [imageUrl],
      body: req.body.body,
      recipe: req.body.recipe,
    });
    return generateResponse(res, 201, post);
  } catch (err) {
    console.log(err);
    return generateResponse(res, 500);
  }
};

exports.update = async function (req, res, next) {
  try {
    const userId = jwt.decode(req.headers["authorization"]).userId;
    const post = await Post.findById(req.params.id.toString());
    //users can only edit their own post or add comments
    let updatedPost;
    if (userId.toString() != post.user.toString()) {
      updatedPost = await Post.findByIdAndUpdate(
        req.params.id.toString(),
        {
          comments: req.body.comments,
        },
        { new: true }
      );
    } else {
      updatedPost = await Post.findByIdAndUpdate(
        req.params.id.toString(),
        req.body,
        { new: true }
      );
    }
    return generateResponse(res, 200, updatedPost);
  } catch (err) {
    return generateResponse(res, 500);
  }
};

exports.delete = async function (req, res, next) {
  try {
    const userId = await jwt.decode(req.headers["authorization"]).userId;
    const deletedPost = await Post.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { isDeleted: true },
      { new: true }
    );
    if (deletedPost) {
      return generateResponse(res, 200, deletedPost);
    } else {
      return generateResponse(res, 400);
    }
  } catch (err) {
    return generateResponse(res, 500);
  }
};

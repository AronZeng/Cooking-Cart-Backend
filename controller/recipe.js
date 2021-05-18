const Recipe = require('../model/recipe');
const User = require('../model/user');
const jwt = require('jsonwebtoken');
const generateResponse = require('../helper/generateResponse');

exports.readOne = async function (req, res, next) {
  try {
    const userId = jwt.decode(req.headers['authorization']).userId;
    const recipe = await Recipe.findById(req.params.id);
    if (
      recipe.isPublic ||
      recipe.owner.toString() == userId ||
      recipe.sharedWith.includes(userId)
    ) {
      return generateResponse(res, 200, recipe);
    }

    return generateResponse(res, 401);
  } catch (err) {
    return generateResponse(res, 500);
  }
};

exports.readMany = async function (req, res, next) {
  console.log('Hit the API');
  //limit and skip are used for pagination
  const limit = parseInt(req.query.limit) || 10;
  const skip = req.query.page ? (parseInt(req.query.page) - 1) * limit : 0;
  try {
    const userId = await jwt.decode(req.headers['authorization']).userId;
    let filters = [
      {
        $or: [
          { isPublic: true },
          { owner: userId },
          { sharedWith: { $elemMatch: { $eq: userId } } },
        ],
      },
      { isDeleted: false },
    ];
    if (req.query.owner) {
      filters.push({ owner: req.query.image });
    }
    if (req.query.tag) {
      filters.push({
        tags: { $elemMatch: { $regex: req.query.tag, $options: 'i' } },
      });
    }
    const recipes = await Recipe.find({
      $and: filters,
    })
      .skip(skip)
      .limit(limit);

    const count = await Recipe.count({ $and: filters });
    return generateResponse(res, 200, { recipes: recipes, count: count });
  } catch (err) {
    console.log('Hit the error block');
    console.log(err);
    return generateResponse(res, 500);
  }
};

exports.create = async function (req, res, next) {
  console.log(typeof req.body.tags);
  console.log(req.body);
  try {
    const recipe = await Recipe.create({
      name: req.body.name,
      ingredients: req.body.ingredients,
      tags: req.body.tags,
      instructions: req.body.instructions,
      isDeleted: false,
      isPublic: req.body.isPublic,
      owner: jwt.decode(req.headers['authorization']).userId,
      sharedWith: req.body.sharedWith,
      description: req.body.description,
    });
    return generateResponse(res, 201, recipe);
  } catch (err) {
    console.log(err);
    return generateResponse(res, 500);
  }
};

exports.update = async function (req, res, next) {
  try {
    const updatedRecipe = await Recipe.findOneAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    return generateResponse(res, 200, updatedRecipe);
  } catch (err) {
    return generateResponse(res, 500);
  }
};

exports.delete = async function (req, res, next) {
  try {
    await Recipe.findByIdAndUpdate(req.params.id, { isDeleted: true });
    return generateResponse(res, 200);
  } catch (err) {
    return generateResponse(res, 500);
  }
};

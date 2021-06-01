const Recipe = require("../model/recipe");
const jwt = require("jsonwebtoken");
const generateResponse = require("../helper/generateResponse");
const User = require("../model/user");

exports.readOne = async function (req, res, next) {
  try {
    const userId = jwt.decode(req.headers["authorization"]).userId;
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
  //limit and skip are used for pagination
  const limit = parseInt(req.query.limit) || 10;
  const skip = req.query.page ? (parseInt(req.query.page) - 1) * limit : 0;

  //controller assumes req.query.tags is an array but when it is just an array with one element the request will just have it as a string
  if (!req.query.tags instanceof Array) {
    req.query.tags = [req.query.tags];
  }
  try {
    const userId = await jwt.decode(req.headers["authorization"]).userId;
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
      filters.push({ owner: req.query.owner });
    }
    if (req.query.tags) {
      let tagsFilters = [];
      for (let tag of req.query.tags) {
        tagsFilters.push({
          tags: { $elemMatch: { $regex: tag, $options: "i" } },
        });
      }
      filters.push({ $or: tagsFilters });
    }

    const recipes = await Recipe.find({
      $and: filters,
    })
      .skip(skip)
      .limit(limit);

    const count = await Recipe.count({ $and: filters });
    return generateResponse(res, 200, { recipes: recipes, count: count });
  } catch (err) {
    console.log(err);
    return generateResponse(res, 500);
  }
};

exports.create = async function (req, res, next) {
  try {
    const userId = jwt.decode(req.headers["authorization"]).userId;
    const file = req.file ? req.file.location : null;
    const recipe = await Recipe.create({
      name: req.body.name,
      ingredients: req.body.ingredients,
      tags: req.body.tags,
      instructions: req.body.instructions,
      isDeleted: false,
      isPublic: req.body.isPublic,
      owner: userId,
      sharedWith: req.body.sharedWith,
      description: req.body.description,
      imageUrl: file,
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: { createdRecipes: recipe._id },
      },
      { new: true }
    );
    return generateResponse(res, 201, { recipe: recipe, user: updatedUser });
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
    const deletedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
      },
      { new: true }
    );
    return generateResponse(res, 200, deletedRecipe);
  } catch (err) {
    return generateResponse(res, 500);
  }
};

exports.uploadFile = async function (req, res, next) {
  try {
    if (req.file && req.file.location) {
      return generateResponse(res, 200, { imageUrl: req.file.location });
    } else {
      return generateResponse(res, 500);
    }
  } catch (err) {
    return generateResponse(res, 500);
  }
};

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recipeSchema = Schema({
  name: { type: String, required: true },
  ingredients: [
    {
      ingredient: { type: Schema.Types.ObjectId, required: true },
      amount: { type: Number, required: true },
    },
  ],
  tags: [{ type: String }],
  instructions: String,
  isDeleted: { type: Boolean, default: false },
  owner: { type: Schema.Types.ObjectId, required: true },
  description: String,
  imageUrl: String,
  //extras for later
  isPublic: { type: Boolean, default: true },
  sharedWith: [{ type: Schema.Types.ObjectId, ref: "user" }],
});

const Recipe = mongoose.model("recipe", recipeSchema);

module.exports = Recipe;

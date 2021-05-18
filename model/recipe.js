const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipeSchema = Schema({
  name: { type: String, required: true },
  ingredients: [
    {
      ingredient: { type: Schema.Types.ObjectId, ref: 'ingredient' },
      amount: { type: Number, required: true },
    },
  ],
  tags: [{ type: String }],
  instructions: [{ type: String }],
  isDeleted: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: true },
  owner: { type: Schema.Types.ObjectId, required: true },
  sharedWith: [{ type: Schema.Types.ObjectId }],
  description: String,
});

const Recipe = mongoose.model('recipe', recipeSchema);

module.exports = Recipe;

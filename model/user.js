const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { units } = require("../helper/constants");

const userSchema = Schema({
  username: { type: String, unique: true },
  password: String,
  email: { type: String, unique: true },
  phoneNumber: String,
  meats: [
    {
      name: { type: String, required: true },
      unit: { type: String, enum: units, required: true },
      amount: { type: Number, required: true },
    },
  ],
  vegetables: [
    {
      name: { type: String, required: true },
      unit: { type: String, enum: units, required: true },
      amount: { type: Number, required: true },
    },
  ],
  spices: [
    {
      name: { type: String, required: true },
      unit: { type: String, enum: units, required: true },
      amount: { type: Number, required: true },
    },
  ],
  condiments: [
    {
      name: { type: String, required: true },
      unit: { type: String, enum: units, required: true },
      amount: { type: Number, required: true },
    },
  ],
  createdRecipes: [
    {
      recipe: { type: Schema.Types.ObjectId, ref: "recipe" },
      requiredIngredients: [
        {
          ingredient: { type: Schema.Types.ObjectId, required: true },
          amount: { type: Number, required: true },
        },
      ],
    },
  ],
  savedRecipes: [
    {
      recipe: { type: Schema.Types.ObjectId, ref: "recipe" },
      requiredIngredients: [
        {
          ingredient: { type: Schema.Types.ObjectId, required: true },
          amount: { type: Number, required: true },
        },
      ],
    },
  ],
});

const User = mongoose.model("user", userSchema);

module.exports = User;

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = Schema({
  username: { type: String, unique: true },
  password: String,
  email: { type: String, unique: true },
  meats: [
    {
      name: { type: String, required: true },
      unit: { type: String, required: true },
      amount: { type: Number, required: true },
    },
  ],
  vegetables: [
    {
      name: { type: String, required: true },
      unit: { type: String, required: true },
      amount: { type: Number, required: true },
    },
  ],
  spices: [
    {
      name: { type: String, required: true },
      unit: { type: String, required: true },
      amount: { type: Number, required: true },
    },
  ],
  condiments: [
    {
      name: { type: String, required: true },
      unit: { type: String, required: true },
      amount: { type: Number, required: true },
    },
  ],
});

const User = mongoose.model('user', userSchema);

module.exports = User;

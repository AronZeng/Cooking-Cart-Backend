const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = Schema({
  user: { type: Schema.Types.ObjectId, required: true },
  images: [
    {
      type: String,
    },
  ],
  body: String,
  recipe: { type: Schema.Types.ObjectId, ref: "recipe" },
  comments: [{ type: String }],
  isDeleted: { type: Boolean, default: false },
  //extras
  // visibility: Number, //probably would end up being an enum
});

const Post = mongoose.model("post", postSchema);

module.exports = Post;

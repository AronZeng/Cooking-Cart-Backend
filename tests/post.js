const request = require("supertest");
const dbHelper = require("./db-helper");
const app = require("../app");
const { expect } = require("chai");
const User = require("../model/user");
const Recipe = require("../model/recipe");
const Post = require("../model/post");
const bcrypt = require("bcrypt");
const path = require("path");

const user = {
  username: "Aron",
  password: "Password1",
  email: "aron@test.com",
};

const user2 = {
  username: "Danny",
  password: "Password1",
  email: "danny@test.com",
};

const recipe = {
  name: "Pizza",
  ingredients: [],
  tags: ["quick, italian"],
  instructions: "just cook it",
  description: "pepperoni pizza",
};

const post = {
  body: "This is the body of the post",
  commends: [],
};

const post2 = {
  body: "This is the body of the post2",
  commends: [],
};
const imagePath = path.join(__dirname + "/images/" + "DSC00222.JPG");

const hashedPassword = bcrypt.hashSync(user.password, 10);

describe("Post Tests", () => {
  //connect to the in memory database
  before(async () => {
    await dbHelper.connect();
  });

  //empty the database after each test case
  afterEach(async () => await dbHelper.clearDatabase());

  //when all the tests finish running then we close the database
  after(async () => await dbHelper.closeDatabase());

  //the user tests start here
  it("Can create a post", async () => {
    const createdUser = await User.create({
      username: user.username,
      password: hashedPassword,
    });
    const createdRecipe = await Recipe.create({
      ...recipe,
      owner: createdUser._id.toString(),
    });

    const login = await request(app)
      .post("/auth/login")
      .set({ "Content-Type": "application/json" })
      .send({ username: user.username, password: user.password });

    const res = await request(app)
      .post("/posts")
      .set({
        "Content-Type": "application/json",
        Authorization: login.body.data.token,
      })
      .attach(imagePath)
      .field({
        ...post,
        user: createdUser._id.toString(),
        recipe: createdRecipe._id.toString(),
      });

    //Assertions
    expect(res.statusCode).to.equal(201);
    expect(res.body.data.body).to.equal(post.body);
    expect(res.body.data.user).to.equal(createdUser._id.toString());
    expect(res.body.data.recipe).to.equal(createdRecipe._id.toString());
    expect(res.body.data.images.length).to.equal(1);
  });
  it("Can update a post", async () => {
    const createdUser = await User.create({
      username: user.username,
      password: hashedPassword,
    });
    const createdRecipe = await Recipe.create({
      ...recipe,
      owner: createdUser._id.toString(),
    });

    const createdPost = await Post.create({
      ...post,
      user: createdUser._id.toString(),
      recipe: createdRecipe._id.toString(),
    });

    const login = await request(app)
      .post("/auth/login")
      .set({ "Content-Type": "application/json" })
      .send({ username: user.username, password: user.password });

    const res = await request(app)
      .put(`/posts/${createdPost._id.toString()}`)
      .set({
        "Content-Type": "application/json",
        Authorization: login.body.data.token,
      })
      .send({
        body: "This is the new body",
      });

    //Assertions
    expect(res.statusCode).to.equal(200);
    expect(res.body.data.body).to.equal("This is the new body");
  });
  it("Cannot edit another user's post", async () => {
    const createdUser = await User.create({
      username: user.username,
      password: hashedPassword,
    });

    await User.create({
      username: user2.username,
      password: hashedPassword,
    });

    const createdRecipe = await Recipe.create({
      ...recipe,
      owner: createdUser._id.toString(),
    });

    const createdPost = await Post.create({
      ...post,
      user: createdUser._id.toString(),
      recipe: createdRecipe._id.toString(),
    });

    const login = await request(app)
      .post("/auth/login")
      .set({ "Content-Type": "application/json" })
      .send({ username: user2.username, password: user2.password });

    const res = await request(app)
      .put(`/posts/${createdPost._id.toString()}`)
      .set({
        "Content-Type": "application/json",
        Authorization: login.body.data.token,
      })
      .send({
        body: "This is the new body",
      });

    //Assertions
    expect(res.statusCode).to.equal(200);
    expect(res.body.data.body).to.equal(createdPost.body);
  });

  it("Can comment on another user's post", async () => {
    const createdUser = await User.create({
      username: user.username,
      password: hashedPassword,
    });

    await User.create({
      username: user2.username,
      password: hashedPassword,
    });

    const createdRecipe = await Recipe.create({
      ...recipe,
      owner: createdUser._id.toString(),
    });

    const createdPost = await Post.create({
      ...post,
      user: createdUser._id.toString(),
      recipe: createdRecipe._id.toString(),
    });

    const login = await request(app)
      .post("/auth/login")
      .set({ "Content-Type": "application/json" })
      .send({ username: user2.username, password: user2.password });

    const res = await request(app)
      .put(`/posts/${createdPost._id.toString()}`)
      .set({
        "Content-Type": "application/json",
        Authorization: login.body.data.token,
      })
      .send({
        comments: ["This is the new comment"],
      });

    //Assertions
    expect(res.statusCode).to.equal(200);
    expect(res.body.data.comments.length).to.equal(1);
  });

  it("Can read one post", async () => {
    const createdUser = await User.create({
      username: user.username,
      password: hashedPassword,
    });

    const createdRecipe = await Recipe.create({
      ...recipe,
      owner: createdUser._id.toString(),
    });

    const createdPost = await Post.create({
      ...post,
      user: createdUser._id.toString(),
      recipe: createdRecipe._id.toString(),
    });

    const login = await request(app)
      .post("/auth/login")
      .set({ "Content-Type": "application/json" })
      .send({ username: user.username, password: user.password });

    const res = await request(app)
      .get(`/posts/${createdPost._id.toString()}`)
      .set({
        "Content-Type": "application/json",
        Authorization: login.body.data.token,
      });

    //Assertions
    expect(res.statusCode).to.equal(200);
    expect(res.body.data.recipe).to.equal(createdRecipe._id.toString());
    expect(res.body.data.user).to.equal(createdUser._id.toString());
  });
  it("Can read many posts", async () => {
    const createdUser = await User.create({
      username: user.username,
      password: hashedPassword,
    });

    const createdRecipe = await Recipe.create({
      ...recipe,
      owner: createdUser._id.toString(),
    });

    const createdPost1 = await Post.create({
      ...post,
      user: createdUser._id.toString(),
      recipe: createdRecipe._id.toString(),
    });

    const createdPost2 = await Post.create({
      ...post2,
      user: createdUser._id.toString(),
      recipe: createdRecipe._id.toString(),
    });

    const login = await request(app)
      .post("/auth/login")
      .set({ "Content-Type": "application/json" })
      .send({ username: user.username, password: user.password });

    const res = await request(app).get("/posts/").set({
      "Content-Type": "application/json",
      Authorization: login.body.data.token,
    });

    //Assertions
    expect(res.statusCode).to.equal(200);
    expect(res.body.data.posts.length).to.equal(2);
    expect(res.body.data.posts[0].user).to.equal(createdUser._id.toString());
    expect(res.body.data.posts[0].recipe).to.equal(
      createdRecipe._id.toString()
    );
    expect(res.body.data.posts[0].body).to.equal(createdPost1.body);
  });
  it("Can read many posts with pagination", async () => {
    const createdUser = await User.create({
      username: user.username,
      password: hashedPassword,
    });

    const createdRecipe = await Recipe.create({
      ...recipe,
      owner: createdUser._id.toString(),
    });

    await Post.create({
      ...post,
      user: createdUser._id.toString(),
      recipe: createdRecipe._id.toString(),
    });

    const createdPost2 = await Post.create({
      ...post2,
      user: createdUser._id.toString(),
      recipe: createdRecipe._id.toString(),
    });

    const login = await request(app)
      .post("/auth/login")
      .set({ "Content-Type": "application/json" })
      .send({ username: user.username, password: user.password });

    const res = await request(app)
      .get("/posts/")
      .set({
        "Content-Type": "application/json",
        Authorization: login.body.data.token,
      })
      .query({
        limit: 1,
        page: 2,
      });

    //Assertions
    expect(res.statusCode).to.equal(200);
    expect(res.body.data.posts.length).to.equal(1);
    expect(res.body.data.posts[0].user).to.equal(createdUser._id.toString());
    expect(res.body.data.posts[0].recipe).to.equal(
      createdRecipe._id.toString()
    );
    expect(res.body.data.posts[0].body).to.equal(createdPost2.body);
  });
  it("Can delete a post", async () => {
    const createdUser = await User.create({
      username: user.username,
      password: hashedPassword,
    });

    const createdRecipe = await Recipe.create({
      ...recipe,
      owner: createdUser._id.toString(),
    });

    const createdPost = await Post.create({
      ...post,
      user: createdUser._id.toString(),
      recipe: createdRecipe._id.toString(),
    });

    const login = await request(app)
      .post("/auth/login")
      .set({ "Content-Type": "application/json" })
      .send({ username: user.username, password: user.password });

    const res = await request(app)
      .delete(`/posts/${createdPost._id.toString()}`)
      .set({
        "Content-Type": "application/json",
        Authorization: login.body.data.token,
      });

    //Assertions
    expect(res.statusCode).to.equal(200);
    expect(res.body.data._id).to.equal(createdPost._id.toString());
    expect(res.body.data.isDeleted).to.equal(true);
  });
});

const request = require("supertest");
const dbHelper = require("./db-helper");
const app = require("../app");
const { expect } = require("chai");
const User = require("../model/user");
const Recipe = require("../model/recipe");
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

const hashedPassword = bcrypt.hashSync(user.password, 10);

const recipe = {
  name: "Pizza",
  ingredients: [],
  tags: ["quick, italian"],
  instructions: "just cook it",
  description: "pepperoni pizza",
};

const recipe2 = {
  name: "Pepperoni Pizza",
  ingredients: [],
  tags: ["pepperoni", "pizza"],
  instructions: "cook the pizza",
  description: "pizza with pepperoni",
};

const imagePath = path.join(__dirname + "/images/" + "DSC00222.JPG");

describe("Recipe Tests", () => {
  //connect to the in memory database
  before(async () => {
    await dbHelper.connect();
  });

  //empty the database after each test case
  afterEach(async () => await dbHelper.clearDatabase());

  //when all the tests finish running then we close the database
  after(async () => await dbHelper.closeDatabase());

  //the user tests start here
  it("Can create a recipe", async () => {
    const savedUser = await User.create({ ...user, password: hashedPassword });

    let login = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send({ username: user.username, password: user.password });

    const res = await request(app)
      .post("/recipes")
      .set({
        "Content-Type": "application/json",
        Authorization: login.body.data.token.toString(),
      })
      .attach("file", imagePath)
      .field(recipe);

    //Assertions
    expect(res.statusCode).to.equal(201);
    expect(res.body.data.recipe.name).to.equal(recipe.name);
    expect(res.body.data.recipe.tags).to.eql(recipe.tags);
    expect(res.body.data.recipe.instructions).to.equal(recipe.instructions);
    expect(res.body.data.user.createdRecipes.length).to.equal(1);
  }).timeout(50000);
  it("Can update a recipe", async () => {
    const createdUser = await User.create({
      ...user,
      password: hashedPassword,
    });

    const createdRecipe = await Recipe.create({
      ...recipe,
      owner: createdUser._id,
    });

    let login = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send({ username: user.username, password: user.password });

    const res = await request(app)
      .put(`/recipes/${createdRecipe._id}`)
      .set({
        "Content-Type": "application/json",
        Authorization: login.body.data.token.toString(),
      })
      .send(recipe2);

    //Assertions
    expect(res.statusCode).to.equal(200);
    expect(res.body.data.name).to.equal(recipe2.name);
    expect(res.body.data.tags).to.eql(recipe2.tags);
    expect(res.body.data.instructions).to.equal(recipe2.instructions);
    expect(res.body.data.description).to.equal(recipe2.description);
  });
  it("Can delete a recipe", async () => {
    const createdUser = await User.create({
      ...user,
      password: hashedPassword,
    });

    const createdRecipe = await Recipe.create({
      ...recipe,
      owner: createdUser._id,
    });

    let login = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send({ username: user.username, password: user.password });

    const res = await request(app).delete(`/recipes/${createdRecipe._id}`).set({
      "Content-Type": "application/json",
      Authorization: login.body.data.token.toString(),
    });

    //Assertions
    expect(res.statusCode).to.equal(200);
    expect(res.body.data.isDeleted).to.equal(true);
  });
  it("Can read one recipe", async () => {
    const createdUser = await User.create({
      ...user,
      password: hashedPassword,
    });

    const createdRecipe = await Recipe.create({
      ...recipe,
      owner: createdUser._id,
    });

    let login = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send({ username: user.username, password: user.password });

    const res = await request(app).get(`/recipes/${createdRecipe._id}`).set({
      "Content-Type": "application/json",
      Authorization: login.body.data.token.toString(),
    });

    //Assertions
    expect(res.statusCode).to.equal(200);
    expect(res.body.data.name).to.equal(recipe.name);
    expect(res.body.data.tags).to.eql(recipe.tags);
    expect(res.body.data.instructions).to.equal(recipe.instructions);
    expect(res.body.data.description).to.equal(recipe.description);
  });
  it("Can read many recipes", async () => {
    const createdUser = await User.create({
      ...user,
      password: hashedPassword,
    });

    const createdRecipe1 = await Recipe.create({
      ...recipe,
      owner: createdUser._id,
    });

    const createdRecipe2 = await Recipe.create({
      ...recipe2,
      owner: createdUser._id,
    });

    let login = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send({ username: user.username, password: user.password });

    const res = await request(app).get(`/recipes/`).set({
      "Content-Type": "application/json",
      Authorization: login.body.data.token.toString(),
    });

    //Assertions
    expect(res.statusCode).to.equal(200);
    expect(res.body.data.recipes.length).to.equal(2);
    expect(res.body.data.count).to.equal(2);
  });
  it("Can read many with pagination", async () => {
    const createdUser = await User.create({
      ...user,
      password: hashedPassword,
    });

    const createdRecipe1 = await Recipe.create({
      ...recipe,
      owner: createdUser._id,
    });

    const createdRecipe2 = await Recipe.create({
      ...recipe2,
      owner: createdUser._id,
    });

    let login = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send({ username: user.username, password: user.password });

    const res = await request(app)
      .get(`/recipes/`)
      .set({
        "Content-Type": "application/json",
        Authorization: login.body.data.token.toString(),
      })
      .query({
        limit: 1,
        page: 1,
      });

    //Assertions
    expect(res.statusCode).to.equal(200);
    expect(res.body.data.recipes.length).to.equal(1);
    expect(res.body.data.count).to.equal(2);
    expect(res.body.data.recipes[0].name).to.equal(recipe.name);
    expect(res.body.data.recipes[0].tags).to.eql(recipe.tags);
    expect(res.body.data.recipes[0].instructions).to.equal(recipe.instructions);
    expect(res.body.data.recipes[0].description).to.equal(recipe.description);
  });
  it("Can read many with owner filter", async () => {
    const createdUser = await User.create({
      ...user,
      password: hashedPassword,
    });

    const createdUser2 = await User.create({
      ...user2,
      password: hashedPassword,
    });

    await Recipe.create({
      ...recipe,
      owner: createdUser._id,
    });

    await Recipe.create({
      ...recipe2,
      owner: createdUser2._id,
    });

    let login = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send({ username: user.username, password: user.password });

    const res = await request(app)
      .get(`/recipes/`)
      .set({
        "Content-Type": "application/json",
        Authorization: login.body.data.token.toString(),
      })
      .query({
        owner: createdUser._id.toString(),
      });

    //Assertions
    expect(res.statusCode).to.equal(200);
    expect(res.body.data.recipes.length).to.equal(1);
    expect(res.body.data.count).to.equal(1);
    expect(res.body.data.recipes[0].name).to.equal(recipe.name);
    expect(res.body.data.recipes[0].tags).to.eql(recipe.tags);
    expect(res.body.data.recipes[0].instructions).to.equal(recipe.instructions);
    expect(res.body.data.recipes[0].description).to.equal(recipe.description);
  });
  it("Can read many with tag filter", async () => {
    const createdUser = await User.create({
      ...user,
      password: hashedPassword,
    });

    await Recipe.create({
      ...recipe,
      owner: createdUser._id,
    });

    await Recipe.create({
      ...recipe2,
      owner: createdUser._id,
    });

    let login = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send({ username: user.username, password: user.password });

    const res = await request(app)
      .get(`/recipes/`)
      .set({
        "Content-Type": "application/json",
        Authorization: login.body.data.token.toString(),
      })
      .query({
        tags: ["pepperoni", "test"],
      });

    //Assertions
    expect(res.statusCode).to.equal(200);
    expect(res.body.data.recipes.length).to.equal(1);
    expect(res.body.data.count).to.equal(1);
    expect(res.body.data.recipes[0].name).to.equal(recipe2.name);
    expect(res.body.data.recipes[0].tags).to.eql(recipe2.tags);
    expect(res.body.data.recipes[0].instructions).to.equal(
      recipe2.instructions
    );
    expect(res.body.data.recipes[0].description).to.equal(recipe2.description);
  });
});

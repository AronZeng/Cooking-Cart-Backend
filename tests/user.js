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

describe("User Tests", () => {
  //connect to the in memory database
  before(async () => {
    await dbHelper.connect();
  });

  //empty the database after each test case
  afterEach(async () => await dbHelper.clearDatabase());

  //when all the tests finish running then we close the database
  after(async () => await dbHelper.closeDatabase());

  //the user tests start here
  it("Can create a user", async () => {
    const res = await request(app)
      .post("/users")
      .set({
        "Content-Type": "application/json",
      })
      .send(user);

    //Assertions
    expect(res.statusCode).to.equal(201);
    expect(res.body.data.username).to.equal(user.username);
    expect(res.body.data.email).to.equal(user.email);
    expect(res.body.data.password).to.not.equal(user.password);
  });
  it("Can update a user", async () => {
    const createdUser = await User.create({
      ...user,
      password: hashedPassword,
    });

    let login = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send({ username: user.username, password: user.password });

    const res = await request(app)
      .put(`/users/${createdUser._id}`)
      .set({
        "Content-Type": "application/json",
        Authorization: login.body.data.token.toString(),
      })
      .send({ email: "aronzeng@test.com" });

    //Assertions
    expect(res.statusCode).to.equal(200);
    expect(res.body.data.email).to.equal("aronzeng@test.com");
  });
  it("Cannot update another user", async () => {
    const createdUser = await User.create({
      ...user,
      password: hashedPassword,
    });

    const createdUser2 = await User.create({
      ...user2,
      password: hashedPassword,
    });

    let login = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send({ username: user.username, password: user.password });

    const res = await request(app).put(`/users/${createdUser2._id}`).set({
      "Content-Type": "application/json",
      Authorization: login.body.data.token.toString(),
    });

    //Assertions
    expect(res.statusCode).to.equal(401);
  });
  it("Can read one user", async () => {
    const createdUser = await User.create({
      ...user,
      password: hashedPassword,
    });

    let login = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send({ username: user.username, password: user.password });

    const res = await request(app).get(`/users/${createdUser._id}`).set({
      "Content-Type": "application/json",
      Authorization: login.body.data.token.toString(),
    });

    //Assertions
    expect(res.statusCode).to.equal(200);
    expect(res.body.data.username).to.equal(user.username);
    expect(res.body.data._id).to.equal(createdUser._id.toString());
  });
  it("Can read many users", async () => {
    await User.create({
      ...user,
      password: hashedPassword,
    });

    await User.create({
      ...user2,
      password: hashedPassword,
    });

    let login = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send({ username: user.username, password: user.password });

    const res = await request(app).get(`/users/`).set({
      "Content-Type": "application/json",
      Authorization: login.body.data.token.toString(),
    });

    //Assertions
    expect(res.statusCode).to.equal(200);
    expect(res.body.data.users.length).to.equal(2);
    expect(res.body.data.count).to.equal(2);
  });
  it("Can read many with pagination", async () => {
    await User.create({
      ...user,
      password: hashedPassword,
    });

    const createdUser2 = await User.create({
      ...user2,
      password: hashedPassword,
    });

    let login = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send({ username: user.username, password: user.password });

    const res = await request(app)
      .get(`/users/`)
      .set({
        "Content-Type": "application/json",
        Authorization: login.body.data.token.toString(),
      })
      .query({
        limit: 1,
        page: 2,
      });

    //Assertions
    expect(res.statusCode).to.equal(200);
    expect(res.body.data.users.length).to.equal(1);
    expect(res.body.data.count).to.equal(2);
    expect(res.body.data.users[0]._id).to.equal(createdUser2._id.toString());
  });
  it("Can read many with search filter", async () => {
    const createdUser = await User.create({
      ...user,
      password: hashedPassword,
    });

    await User.create({
      ...user2,
      password: hashedPassword,
    });

    let login = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send({ username: user.username, password: user.password });

    const res = await request(app)
      .get(`/users/`)
      .set({
        "Content-Type": "application/json",
        Authorization: login.body.data.token.toString(),
      })
      .query({
        search: "aron",
      });

    //Assertions
    expect(res.statusCode).to.equal(200);
    expect(res.body.data.users.length).to.equal(1);
    expect(res.body.data.count).to.equal(1);
    expect(res.body.data.users[0]._id).to.equal(createdUser._id.toString());
  });
});

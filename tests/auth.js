const request = require("supertest");
const dbHelper = require("./db-helper");
const app = require("../app");
const { expect } = require("chai");
const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Token = require("../model/token");

const user = {
  username: "Aron",
  password: "Password1",
  email: "aron@test.com",
};

describe("Auth Tests", () => {
  //connect to the in memory database
  before(async () => {
    await dbHelper.connect();
  });

  //empty the database after each test case
  afterEach(async () => await dbHelper.clearDatabase());

  //when all the tests finish running then we close the database
  after(async () => await dbHelper.closeDatabase());

  //the user tests start here
  it("Can login", async () => {
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    const savedUser = await User.create({ ...user, password: hashedPassword });

    let res = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send({ username: user.username, password: user.password });

    const decodedToken = jwt.decode(res.body.data.token);
    //Assertions
    expect(res.statusCode).to.equal(200);
    expect(decodedToken.userId).to.equal(savedUser._id.toString());
    //our token expiry time is in 10 hours so we verify that the token's expiry time and issued at time difference is that
    //note the units are in seconds so the difference should be 36000 seconds
    expect(decodedToken.exp - decodedToken.iat).to.equal(36000);
  });
  it("Cannot login with invalid credentials", async () => {
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    await User.create({
      ...user,
      password: hashedPassword,
    });

    let res = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send({ username: user.username, password: "wrongpassword" });

    //Assertions
    expect(res.statusCode).to.equal(401);
    expect(res.body.message).to.equal("Invalid Login");
  });
  it("Can logout", async () => {
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    const createdUser = await User.create({
      ...user,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { userId: createdUser._id },
      process.env.TOKEN_SECRET,
      { expiresIn: "10h" }
    );

    await Token.create({
      user: createdUser._id,
      token: token,
    });

    let res = await request(app).post("/auth/logout").set({
      "Content-Type": "application/json",
      Authorization: token.toString(),
    });

    //Assertions
    expect(res.statusCode).to.equal(200);
  });
  it("Logout returns users already logged out", async () => {
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    const createdUser = await User.create({
      ...user,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { userId: createdUser._id },
      process.env.TOKEN_SECRET,
      { expiresIn: "10h" }
    );

    let res = await request(app).post("/auth/logout").set({
      "Content-Type": "application/json",
      Authorization: token.toString(),
    });

    //Assertions
    expect(res.statusCode).to.equal(400);
    expect(res.body.message).to.equal("User is already logged out");
  });
});

const express = require("express");
const router = express.Router();
const userController = require("../controller/user");
const { validateToken } = require("../middleware/validate");

router.get("/:id", validateToken, userController.readOne);
router.get("/", userController.readMany);
router.post("/", userController.create);
router.put("/:id", validateToken, userController.update);
router.post("/groceryList", validateToken, userController.groceryList);

module.exports = router;

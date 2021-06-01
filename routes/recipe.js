const express = require("express");
const router = express.Router();
const recipeController = require("../controller/recipe");
const { validateToken } = require("../middleware/validate");
const upload = require("../middleware/upload");

router.get("/:id", validateToken, recipeController.readOne);
router.get("/", validateToken, recipeController.readMany);
router.post("/", validateToken, upload.single("file"), recipeController.create);
router.put("/:id", validateToken, recipeController.update);
router.delete("/:id", validateToken, recipeController.delete);
router.post("/uploadFile", upload.single("file"), recipeController.uploadFile);

module.exports = router;

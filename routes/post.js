const express = require("express");
const router = express.Router();
const postController = require("../controller/post");
const { validateToken } = require("../middleware/validate");
const upload = require("../middleware/upload");

router.get("/:id", validateToken, postController.readOne);
router.get("/", validateToken, postController.readMany);
router.post("/", validateToken, upload.single("file"), postController.create);
router.put("/:id", validateToken, postController.update);
router.delete("/:id", validateToken, postController.delete);

module.exports = router;

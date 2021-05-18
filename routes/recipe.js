const express = require('express');
const router = express.Router();
const recipeController = require('../controller/recipe');
const { validateToken } = require('../middleware/validate');

router.get('/:id', validateToken, recipeController.readOne);
router.get('/', validateToken, recipeController.readMany);
router.post('/', validateToken, recipeController.create);
router.put('/:id', validateToken, recipeController.update);
router.delete('/:id', validateToken, recipeController.delete);

module.exports = router;

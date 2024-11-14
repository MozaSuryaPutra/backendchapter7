const express = require("express");
const {
  validateGetCars,
  validateGetCarsById,
  validateCreateCars,
  validateUpdateCars,
  validateDeleteCars,
  validateGetCarsSearched,
} = require("../middlewares/cars.js");
const {
  getCars,
  createCars,
  updateCars,
  deleteCarsById,
  getCarsSearched,
} = require("../controllers/cars.js");
const { getCarsById } = require("../controllers/cars.js");
const { authorization } = require("../middlewares/auth");
const router = express.Router();

router.get("/", authorization(1, 2), validateGetCars, getCars);
router.get(
  "/search",
  authorization(1, 2),
  validateGetCarsSearched,
  getCarsSearched
);
router.get("/:id", authorization(1, 2), validateGetCarsById, getCarsById);
router.post("/", authorization(1), validateCreateCars, createCars);
router.put("/:id", authorization(1), validateUpdateCars, updateCars);
router.delete("/:id", authorization(1), validateDeleteCars, deleteCarsById);
module.exports = router;

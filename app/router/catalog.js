const express = require("express");
const router = express.Router();
const { verifyToken } = require('../modules/functions.js');

// addStrToArr middleware for converting comma-separated strings to arrays
const { addStrToArr } = require("../middlewares/convertStringToArray");

const { CatalogController } = require("../controllers/catalog.controller");

router.post("/create", verifyToken, addStrToArr("categories"), CatalogController.createCatalog);
router.get("/list", verifyToken, CatalogController.getAllCatalogs);
router.get("/:id", verifyToken, CatalogController.getCatalogById);
router.put("/edit/:id", verifyToken, CatalogController.updateCatalog);
router.delete("/remove/:id", verifyToken, CatalogController.removeCatalog);

module.exports = {
    catalogRoutes: router
}
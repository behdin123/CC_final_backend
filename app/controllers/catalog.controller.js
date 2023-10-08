const autoBind = require("auto-bind");
const { CatalogModel } = require("../models/catalog");

class CatalogController {
    constructor() {
        autoBind(this);
    }

    async createCatalog(req, res, next) {
        try {
            const { name, description, categories, status } = req.body;

            const catalog = await CatalogModel.create({ name, description, categories, status });

            return res.status(201).json({
                status: 201,
                success: true,
                catalog
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllCatalogs(req, res, next) {
        try {
            const catalogs = await CatalogModel.find({});
            return res.status(200).json({
                status: 200,
                success: true,
                catalogs
            });
        } catch (error) {
            next(error);
        }
    }

    async getCatalogById(req, res, next) {
        try {
            const catalogId = req.params.id;
            const catalog = await CatalogModel.findById(catalogId);
            return res.status(200).json({
                status: 200,
                success: true,
                catalog
            });
        } catch (error) {
            next(error);
        }
    }

    async updateCatalog(req, res, next) {
        try {
            const catalogId = req.params.id;
            const { name, description, categories, status } = req.body;

            const catalog = await CatalogModel.findByIdAndUpdate(catalogId, { name, description, categories, status }, { new: true });

            return res.status(200).json({
                status: 200,
                success: true,
                catalog
            });
        } catch (error) {
            next(error);
        }
    }

    async removeCatalog(req, res, next) {
        try {
            const catalogId = req.params.id;
            await CatalogModel.findByIdAndDelete(catalogId);
            return res.status(200).json({
                status: 200,
                success: true,
                message: "Catalog successfully deleted."
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = {
    CatalogController: new CatalogController(),
  };
  
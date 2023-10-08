const mongoose = require("mongoose");

const CatalogSchema = new mongoose.Schema({
    name: { type: String, required: true },
    categories: { type: [String], default: [] }, 
    description: { type: String },
    status: { type: Boolean, default: false },
}, {
    timestamps: true
});

const CatalogModel = mongoose.model("catalog", CatalogSchema);

module.exports = {
    CatalogModel
}
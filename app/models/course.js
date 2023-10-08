/**
 * This file exports a Mongoose Model for a course document.
 */

const mongoose = require("mongoose");

// Define a new Mongoose schema for CourseSchema
const CourseSchema = new mongoose.Schema({
    catalog: { type: mongoose.Types.ObjectId, ref: "catalog" },
    title : {type : String, required : true},
    description : {type : String},
    image : {type : String, default : "/defaults/default.png"},
    owner : {type : mongoose.Types.ObjectId},
    team : {type : mongoose.Types.ObjectId},
    private : {type : Boolean},
    tags : {type : [String], default : []}
}, {
    timestamps : true
});

// Create a Mongoose Model for the course document with the defined schema
const CourseModel = mongoose.model("course", CourseSchema);

module.exports = {
    CourseModel
}


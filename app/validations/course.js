/**
 * This file exports a function that returns an array of Express validator middleware functions for validating course data.
 * The array includes validators for the course title, tags, and description.
 */

const { body } = require("express-validator");

function createCourseValidator(){
    return [
        // Validator for the course title
        body("title").notEmpty().withMessage("The title shouldn't be empty"),

        // Validator for the course tags
        body("tags").isArray({min : 0, max : 10}).withMessage("The maximum use of hashtags is 10 "),

        // Validator for the course description
        body("description").notEmpty().isLength({min : 5}).withMessage("course description cannot be empty and must be at least 5 characters long"),
    ]
}

module.exports = {
    createCourseValidator
}
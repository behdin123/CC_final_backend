/**
 * This file defines the routes for course-related requests.
 * It imports the CourseController for handling course-related logic,
 * and various middlewares and functions for handling user input validation, file uploads, authentication, and request mapping.
 * It maps the routes to specific controller functions that handle the logic of the routes.
*/ 

// For handling course-related requests
const { CourseController } = require("../controllers/course.controller");

const { verifyToken } = require('../modules/functions.js');

// For handling validation errors
const { expressValidatorMapper } = require("../middlewares/checkErrors");

// For validating user input when creating a new course
const { createCourseValidator } = require("../validations/course");

// For handling file uploads using the express-fileupload module
const { uploadFile } = require("../modules/express-fileupload");

// express-fileupload module for handling file uploads
const fileupload = require("express-fileupload");

// mongoIDValidator function for validating MongoDB ObjectIds
const { mongoIDValidator } = require("../validations/public");

// addStrToArr middleware for converting comma-separated strings to arrays
const { addStrToArr } = require("../middlewares/convertStringToArray");


const router = require("express").Router();


// Create a new course with a catalogID
router.post("/create/:catalogID", fileupload(), verifyToken, addStrToArr("tags"), uploadFile, createCourseValidator(),expressValidatorMapper, CourseController.createCourse)

// Get a list of all courses from a specific catalog
router.get("/list/:catalogID", verifyToken, CourseController.getAllCourse)

// Get a specific course by ID
router.get("/:id", verifyToken, mongoIDValidator("id"), expressValidatorMapper, CourseController.getCourseById)

// Read specific course - By any property 
// This is not longer Case Sensitive because of ($options:'i')
router.get("/search/:value", verifyToken, CourseController.searchCourses)

// Remove a course by ID
router.delete("/remove/:id", verifyToken, mongoIDValidator("id"), expressValidatorMapper, CourseController.removeCourse)

// Update a course by ID
router.put("/edit/:id", verifyToken, mongoIDValidator("id"), expressValidatorMapper, CourseController.updateCourse)

// Update a course's image by ID
router.patch("/edit-courseImage/:id", fileupload(), verifyToken, uploadFile, mongoIDValidator("id"), expressValidatorMapper,CourseController.updateCourseImage)

// Export the router as a module
module.exports = {
    courseRoutes : router
}
/**
 * This file defines the routes for handling slide-related operations.
 * Each route uses the SlideController to handle the operation.
 *
 * Middleware:
 * - verifyToken: Ensures the user is logged in before accessing protected routes
 * - mongoIDValidator: Validates MongoDB ObjectIds in the route parameters
 * - expressValidatorMapper: Handles validation errors
 */

const { SlideController } = require("../controllers/slide.controller");

const { verifyToken } = require('../modules/functions.js');

const { mongoIDValidator } = require("../validations/public");

// For handling file uploads using the express-fileupload module
const { /* uploadImageMiddleware, uploadVideoMiddleware, */ uploadFile, uploadPdf, uploadVideo } = require("../modules/express-fileupload");

// express-fileupload module for handling file uploads
const fileupload = require("express-fileupload");

const { expressValidatorMapper } = require("../middlewares/checkErrors");

const router = require("express").Router();

// Create a new slide
router.post("/lesson/:lessonId/create", fileupload(),
(req, res, next) => { console.log("After fileupload"); next(); },
verifyToken,
(req, res, next) => { console.log("After verifyToken"); next(); }, mongoIDValidator("lessonId"), (req, res, next) => { console.log("After mongoIDValidator"); next(); }, 
/* uploadImageMiddleware */
uploadFile, (req, res, next) => { console.log("After uploadFile"); next(); }, 
/* uploadVideoMiddleware */
uploadVideo, (req, res, next) => { console.log("After uploadVideo"); next(); }, SlideController.createSlide);

// Get slides by lesson ID
router.get("/lesson/:lessonId/slides", verifyToken, mongoIDValidator("lessonId"), expressValidatorMapper, SlideController.getSlidesByLesson);

// Get a slide by its ID
router.get("/:slideId", verifyToken, mongoIDValidator("slideId"), expressValidatorMapper, SlideController.getSlideById);

// Update a slide
router.put("/:slideId/update", verifyToken, mongoIDValidator("slideId"), expressValidatorMapper, SlideController.updateSlide);

// Update a slide's image by ID
router.patch("/edit-slideImage/:slideId", fileupload(), verifyToken, uploadFile, mongoIDValidator("slideId"), expressValidatorMapper, SlideController.updateSlideImage)

// Delete a slide
router.delete("/:slideId/delete", verifyToken, mongoIDValidator("slideId"), expressValidatorMapper, SlideController.deleteSlide);

// Update the lesson of a slide
router.put("/:slideId/update-lesson", verifyToken, mongoIDValidator("slideId"), expressValidatorMapper, SlideController.updateSlideLesson);

// Upload a PDF to create slides
router.post('/upload-pdf', fileupload(), verifyToken, uploadPdf, SlideController.uploadPdf);




module.exports = {
  slideRoutes: router,
};
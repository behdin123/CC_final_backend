const { CourseController } = require("../controllers/course.controller");

const { verifyToken } = require('../modules/functions.js');

const { mongoIDValidator } = require("../validations/public");

const { expressValidatorMapper } = require("../middlewares/checkErrors");

const router = require("express").Router();

// Get a lesson by the lesson ID
router.get("/:courseId/lessons", verifyToken, mongoIDValidator("courseId"), expressValidatorMapper, CourseController.getLessonsByCourseId);


module.exports = {
    lessonRoutes : router
}
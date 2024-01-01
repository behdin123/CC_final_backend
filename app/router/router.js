/**
 * This file exports all routes used in the application.
 * The module imports routes from the 'auth', 'course', 'team', and 'user' modules
 * and maps them to specific routes using the Express Router middleware. 
*/

// Express Router middleware
const router = require("express").Router();

// Import routes for authentication, course, team, user
const { authRoutes } = require("./auth");

const { catalogRoutes } = require("./catalog");

const { courseRoutes } = require("./course")

const { lessonRoutes } = require("./lessons");

const { slideRoutes } = require("./slide");

const { userRoutes } = require("./user");

// Routes for authentication, catalog, course, lessons, slides, user
router.use("/auth", authRoutes)

router.use("/catalog", catalogRoutes);

router.use("/course", courseRoutes)

router.use("/course", lessonRoutes);

router.use("/course", slideRoutes);

router.use("/user", userRoutes)


module.exports = {
    AllRoutes : router
}
/**
 * This file defines the routes for authentication-related requests.
 * It imports middlewares and functions for handling user input validation.
 * Maps the routes to specific controller functions that handle the logic of the routes. 
*/

const router = require("express").Router();

// Middleware for handling validation errors
const { expressValidatorMapper } = require("../middlewares/checkErrors");

// Functions for validating user input in the 'auth' module
const { registerValidator, loginValidation } = require("../validations/auth");

// For handling authentication-related requests
const {AuthController} = require("./../controllers/auth.controller")


// Route for registering a new user
router.post("/register", registerValidator(), expressValidatorMapper, AuthController.register)

// Route for logging in a user
router.post("/login", loginValidation(), expressValidatorMapper, AuthController.login)

module.exports = {
    authRoutes : router
}
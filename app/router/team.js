/**
 * This file defines routes for team operations.
 * It imports the necessary middleware and validation functions, as well as the TeamController object from the team.controller.js file.
 * Each route specifies the HTTP method, URL path, required middleware functions for authentication and validation, and the matching controller method to handle the request.
 */

// Importing the TeamController object from the team.controller.js file.
const { TeamController } = require("../controllers/team.controller");

// const { verifyToken } 
const { verifyToken } = require('../modules/functions.js');

// expressValidatorMapper middleware function from the checkErrors.js file.
const { expressValidatorMapper } = require("../middlewares/checkErrors");

// mongoIDValidator validation function from the public.js file.
const { mongoIDValidator } = require("../validations/public");

// Importing the createTeamValidator validation function from the team.js file located in the validations folder.
const { createTeamValidator } = require("..//validations/team");


const router = require("express").Router();


// Create a new team
router.post("/create", verifyToken, createTeamValidator(), expressValidatorMapper,  TeamController.createTeam)

// Get a list of all teams
router.get("/list", verifyToken, TeamController.getListOfTeam)

// Get the current user's teams
router.get("/me", verifyToken, TeamController.getMyTeams)

// Invite a user to a team
router.get("/invite/:teamID/:username", verifyToken, TeamController.inviteUserToTeam)

// Get a specific team by ID
router.get("/:id", verifyToken, mongoIDValidator("id"), expressValidatorMapper, TeamController.getTeamById)

// Remove a team by ID
router.delete("/remove/:id", verifyToken, mongoIDValidator("id"), expressValidatorMapper, TeamController.removeTeamById)

// Update a team by ID
router.put("/update/:teamID", verifyToken, TeamController.updateTeam)

module.exports = {
    teamRoutes : router
}
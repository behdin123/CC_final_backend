/**
 * This file exports a function that returns an array of Express validator middleware functions for validating MongoDB ObjectIDs.
 * The array includes a validator for checking if the submitted ID is a valid MongoDB ObjectID.
 */

const { param } = require("express-validator");

function mongoIDValidator(paramName) {
  return [
    // Validator for the MongoDB ObjectID
    param(paramName)
    .isMongoId()
    .withMessage("The submitted ID is not valid"),
  ];
}
module.exports = {
  mongoIDValidator,
};

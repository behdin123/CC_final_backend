/**
 * This middleware checks if the user is logged in by verifying the JWT token in the Authorization header.
 * If the token is valid, the user's data is added to the request object.
 * If the token is not valid or missing, the middleware throws an error.
*/

// Import dependencies
const { UserModel } = require("../models/user");
const { verifyJwtToken } = require("../modules/functions");


// Define middleware function
const checkLogin = async (req, res, next) => {
  try {

    // Define authentication error object
    let authError = { status: 401, message: "Please log in to your account" };

    // Get Authorization header from the request object
    const authorization = req?.headers?.authorization;
    
    // Throw error if Authorization header is missing
    if (!authorization) throw authError;

    // Verify token and get user data from the token payload
    const result = verifyJwtToken(token);
    const { username } = result;

    // Find user in the database by username and exclude the password field from the result
    const user = await UserModel.findOne({ username }, { password: 0 });

    // Throw error if user not found
    if (!user) throw authError;

    // Add user data to the request object
    req.user = user;

    // Call the next middleware function
    return next();

  } 
  catch (error) {
    // Call the error handling middleware function
    next(error);
  }
};

// Export the middleware function
module.exports = {
  checkLogin,
};

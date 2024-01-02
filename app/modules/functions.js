/**
 * This file exports utility functions related to hashing, creating and verifying JWT tokens, 
 * creating upload paths, and creating links for files.
 */

// Import dependencies
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");


/**
 * Returns a hashed string based on the input string.
 * @param {string} str - The input string to be hashed.
 * returns string - The hashed string.
 */
function hashString(str){
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(str, salt)
}


/**
 * Generates a JWT token based on the input payload. tokenGenerator
 * @param {object} payload - The payload to be included in the token.
 * returns string - The generated JWT token.
 */

function tokenGenerator(user) {
  const payload = {
    _id: user._id,
    username: user.username,
  };

  const token = jwt.sign(
    payload, 

    //Token_SECRET
    process.env.SECRET_KEY, 

    //EXPIRATION TIME
    { expiresIn: process.env.JWT_EXPIRES_IN, }
    );
  return token;
}


const verifyToken = (req, res, next) => {
    // Get JWT token from the cookie
    const token = req.cookies.jwt;
  
    // Check if the token exists
    if (!token) {
      return res.status(401).json({
        status: 401,
        success: false,
        message: "Access denied. No token provided.",
      });
    }
  
    try {
      // Verify and decode the token
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      
      // Add the decoded user data to the request object
      req.user = decoded;
      
      // Continue to the next middleware function
      next();
    } catch (error) {
      // Handle token verification errors
      res.status(401).json({
        status: 401,
        success: false,
        message: "Invalid token.",
      });
    }
};


/**
 * Creates a path for uploading files based on the current date.
 * returns string - The created path.
 */
/* function createUploadPath(){
    let d = new Date();
    const Year = ""+d.getFullYear();
    const Month = d.getMonth() + "";
    const day = "" + d.getDate();

    const uploadPath = path.join(__dirname, "..", "..", "public", "upload", Year, Month, day);
    fs.mkdirSync(uploadPath, {recursive : true});
    return path.join("public", "upload", Year, Month, day);
} */

function createUploadPath(){
  /* let d = new Date();
  const Year = ""+d.getFullYear();
  const Month = d.getMonth() + "";
  const Day = "" + d.getDate();
   */
  
  // Opdateret sti, som peger på mount pathen af din disk på Render
  const uploadPath = path.join("/public/upload");
  fs.mkdirSync(uploadPath, {recursive : true});

  return path.join("public", "upload");
}

/**
 * Creates a link for a file address.
 * @param {string} fileAddress - The file address, to create a link for.
 * @param {object} req - The Express request object.
 * returns string - The created file link.
 */
function createLinkForFiles(fileAddress, req){
    return fileAddress? ("https" + "://" + req.get("host")+ "/" + (fileAddress.replace(/[\\\\]/gm, "/"))) : undefined
}

module.exports = {
    hashString,
    createLinkForFiles,
    tokenGenerator,
    verifyToken,
    createUploadPath
}
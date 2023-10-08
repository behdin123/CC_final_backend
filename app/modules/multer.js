/**
 * This file exports a middleware created with Multer for uploading files.
 * The middleware uses disk storage and custom filename generation to save files to the specified upload path.
 */

// Import dependencies
const multer = require("multer");
const path = require("path");
const { createUploadPath } = require("./functions");


// Define disk storage configuration for Multer
const storage = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, createUploadPath())
    },
    filename : (req, file, cb) => {
        const type = path.extname(file?.originalname || "")
        cb(null, Date.now() + type)
    }
});


// Create Multer middleware for file uploads
const upload_multer = multer({storage})


module.exports = {
    upload_multer
}
/**
 * This file exports a middleware function for uploading a file.
 * The function checks whether a file has been submitted and whether it is in a valid format.
 * If the file is valid, it is moved to the appropriate directory.
*/

const path = require("path");
const { createUploadPath } = require("./functions");
const util = require('util');
const fileUpload = require('express-fileupload');


const uploadFile = async (req, res, next) => {
    
    try {
        console.log("uploadFile middleware called");
        console.log("Files in Request:", req.files);


        let fileKey;
        if (req.route.path.includes("slideBanner")) {
            fileKey = "banner";
        } else if (req.route.path.includes("slideFooter")) {
            fileKey = "footer";
        } else {
            fileKey = "image";
        }
        
        console.log("Looking for file with key:", fileKey);
        
        // Check if a file was submitted
        if (!req.files || !req.files[fileKey]) {
            throw { status: 400, message: `Please submit the ${fileKey}` };
        }

        let file = req.files[fileKey];
        let type = path.extname(file.name).toLowerCase();

        // Check if the file format is valid
        if(![".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(type)) throw {status : 400, message : "The submitted image format is not valid"}

        // Set the image path
        const file_path =  path.join(createUploadPath(), (Date.now() + type))
        req.body[fileKey] = file_path.substring(7);

        let uploadPath = path.join(__dirname, "..", "..", file_path);
        console.log(uploadPath)

        // Move the file to the appropriate directory
        file.mv(uploadPath, (err) => {
            if(err) throw {status : 500, message : "Image upload failed"}
            next();
         })

    } catch (error) {
        next(error)
    }
};


    

const uploadPdf = async (req, res, next) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            throw {status: 400, message: "Please submit a PDF"}
        }

        let pdf = req.files.pdf;
        let type = path.extname(pdf.name).toLowerCase();

        if (type !== ".pdf") {
            throw {status: 400, message: "The submitted file format is not valid. Please upload a PDF file"}
        }

        const pdf_path = path.join(createUploadPath(), (Date.now() + type));
        let uploadPath = path.join(__dirname, "..", "..", pdf_path);

        const mv = util.promisify(pdf.mv);  // util.promisify to create a Promise-based version of pdf.mv
        await mv(uploadPath);  // await to ensure the file is moved before moving on

        // Store the upload path in req.file so it can be accessed in the next middleware
        req.file = uploadPath;

        next();
    } catch (error) {
        next(error);
    }
};


const uploadVideo = async (req, res, next) => {
    try {
        
        if (!req.files || Object.keys(req.files).length === 0 || !req.files.video) {
            // Hvis der ikke er nogen filer, eller hvis der ikke er nogen video fil, fortsæt til næste middleware eller controller
            return next();
        }

        let video = req.files.video;
        let type = path.extname(video.name).toLowerCase();

        if (type !== ".mp4" && type !== ".avi" && type !== ".mov") {
            throw {status: 400, message: "The submitted file format is not valid. Please upload a video file"}
        }

        const video_path = path.join(createUploadPath(), (Date.now() + type));
        let uploadPath = path.join(__dirname, "..", "..", video_path);

        const mv = util.promisify(video.mv);
        await mv(uploadPath); 

        req.file = uploadPath;

        next();
    } catch (error) {
        next(error);
    }
};


module.exports = {
    uploadFile,
    uploadPdf,
    uploadVideo,
}

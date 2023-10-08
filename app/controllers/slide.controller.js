/**
 * This file defines the SlideController class, which handles slide-related operations.
 * The controller includes methods to create, read, update, delete, and change the lesson of a slide.
 */

const autoBind = require("auto-bind");
const { SlideModel } = require("../models/slide");
const { LessonModel } = require("../models/lesson");
const { processPdfFile } = require("../modules/pdfParse");
const path = require('path');
const fs = require('fs');

class SlideController {
  constructor() {
    autoBind(this);
  }
  
  // Creates a new slide in the specified lesson
  async createSlide(req, res, next) {
    try {
      console.log("Inside createSlide function");

      const lessonId = req.params.lessonId;

      console.log("LessonId:", lessonId);

      const { title, description, text, image } = req.body;
      const video = req.file ? req.file : '';

      console.log(`Title: ${title}, Description: ${description}, Text: ${text}, Image: ${image}, LessonId: ${lessonId}, Video: ${video}`);


      const lesson = await LessonModel.findById(lessonId);
      console.log("Found lesson:", lesson);

      if (!lesson) throw { status: 404, message: "Lesson not found" };

      const slide = await SlideModel.create({ title, description, text, image, lesson: lessonId, video});
      console.log("Created slide:", slide);

      if (!slide) throw { status: 400, message: "Failed to create slide" };

      return res.status(201).json({
        status: 201,
        success: true,
        message: "Slide created successfully",
        slide,
      });
    } catch (error) {
      next(error);
    }
  }


  // This function is to upload a PDF, convert it to text, and create slides from the text.
  async uploadPdf(req, res, next) {
    try {
        console.log('req.file:', req.file);
        console.log('req.body:', req.body);

        // Store the file path of the uploaded file.
        const filePath = req.file;

        // convert the PDF at the given path to text.
        const text = await processPdfFile(filePath);

        // Split the text into an array of slides, using the double newline
        const slidesText = text.split('\n\n');
        
        const lessonId = req.body.lessonId;


        const slides = [];
        // Loop over the array of slide texts.
        for (let i = 0; i < slidesText.length; i++) {
            // Get the text for the current slide.
            const slideText = slidesText[i];

            // The first line of the slide text is treated as the title.
            const title = slideText.split('\n')[0];
            // The rest of the slide text is treated as the text.
            const text = slideText.split('\n').slice(1).join('\n');

            // Create a new slide document with the extracted title and text, lesson ID and the order (i+1).
            const slide = await SlideModel.create({ title, text, description: '', lesson: lessonId, order: i + 1 });
            slides.push(slide);
        }


        // Delete the uploaded PDF file after processing.
        fs.unlinkSync(filePath);

        return res.status(201).json({
            status: 201,
            success: true,
            message: "Slides created successfully",
            slides,
        });
    } catch (error) {
        next(error);
    }
  }


  // Retrieves slides by their lesson ID
  async getSlidesByLesson(req, res, next) {
    try {
      const { lessonId } = req.params;

      const slides = await SlideModel.find({ lesson: lessonId });

      if (!slides) throw { status: 404, message: "Slides not found" };

      return res.status(200).json({
        status: 200,
        success: true,
        slides,
      });

    } catch (error) {
      next(error);
    }
  }

  // Retrieves a slide by its ID
  async getSlideById(req, res, next) {
    try {
      const { slideId } = req.params;

      const slide = await SlideModel.findById(slideId);
      if (!slide) throw { status: 404, message: "Slide not found" };

      return res.status(200).json({
        status: 200,
        success: true,
        slide,
      });
    } catch (error) {
      next(error);
    }
  }

// Updates a slide's title, description, and text
async updateSlide(req, res, next) {

  console.log('Request Body:', req.body);
  console.log('Request Params:', req.params);
  console.log('Request Files:', req.files); 
  
  try {
    const slideId = req.params.slideId;
    const data = { ...req.body };

    // Fjern uønskede eller ugyldige felter fra dataobjektet
    ["image", "video"].concat(Object.keys(data))
      .filter(key => !["title", "description", "text"].includes(key))
      .forEach(key => delete data[key]);

    // Find og opdater slide i databasen
    const updatedSlide = await SlideModel.findByIdAndUpdate(slideId, { $set: data }, { new: true });
    
    if (!updatedSlide) throw { status: 400, message: "The update was not successful" };
    
    return res.status(200).json({
      status: 200,
      success: true,
      message: "Slide updated successfully",
      slide: updatedSlide,
    });
    
  } catch (error) {
    next(error);
  }
}


async updateSlideImage(req, res, next) {
  try {
      // Log the parameters, user, and files
      console.log("Params: ", req.params);
      console.log("User: ", req.user);
      console.log("Files: ", req.files);
     
      const slideId = req.params.slideId;  
      const owner = req.user._id;
      
      // Validate if the slide belongs to the user
      const slide = await SlideModel.findOne({ _id: slideId, owner }); 
      if (!slide) throw { status: 404, message: "Slide not found or user not authorized" };
      
      // Validate the uploaded image
      if (!req.files || !req.files.image || !req.files.image.name) throw { status: 400, message: "No image file provided" };
      
      // Log the validated image path
      console.log("Validated image path: ", req.body.image);

      const imagePath = req.body.image;
      
      // Update the slide image in the database
      const updatedSlide = await SlideModel.findByIdAndUpdate(
          slideId,
          { $set: { image: imagePath } },
          { new: true }
      );
      
      // Log the updated slide object
      console.log("Updated Slide: ", updatedSlide);
      
      // Return success message with the updated slide
      return res.status(200).json({
          status: 200,
          success: true,
          message: "Slide image updated successfully",
          slide: updatedSlide,
      });

  } catch (error) {
      console.error("Caught an error: ", error); // Changed to console.error for logging errors
      next(error);
  }
}



  // Deletes a slide by its ID
  async deleteSlide(req, res, next) {
    try {
      const { slideId } = req.params;

      const slide = await SlideModel.findByIdAndDelete(slideId);
      if (!slide) throw { status: 404, message: "Slide not found" };

      return res.status(200).json({
        status: 200,
        success: true,
        message: "Slide deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Updates a slide's lesson when it is dragged and dropped to another lesson
  async updateSlideLesson(req, res, next) {
    try {
      const { slideId } = req.params;
      const { lessonId } = req.body;

      const slide = await SlideModel.findByIdAndUpdate(slideId, { lesson: lessonId }, { new: true });
      if (!slide) throw { status: 404, message: "Slide not found" };

      return res.status(200).json({
        status: 200,
        success: true,
        message: "Slide lesson updated successfully",
        slide,
      });
    } catch (error) {
      console.error('Error in updateSlideLesson:', error);
      next(error);
    }
  }

}




module.exports = {
  SlideController: new SlideController(),
};
/**
 * This file defines the SlideController class, which handles slide-related operations.
 * The controller includes methods to create, read, update, delete, and change the lesson of a slide.
 */

const autoBind = require("auto-bind");
const { SlideModel } = require("../models/slide");
const { LessonModel } = require("../models/lesson");
const { processPdfFile } = require("../modules/pdfParse");
const { createLinkForFiles } = require("../modules/functions");
const path = require('path');
const fs = require('fs');

class SlideController {
  constructor() {
    autoBind(this);
  }
  
  // Creates a new slide in the specified lesson
  async createSlide(req, res, next) {
    try {
      const lessonId = req.params.lessonId;

      const { title, description, text, banner, footer } = req.body;
      const video = req.file ? req.file : '';
      const image = req.file ? req.file : '';

      const lesson = await LessonModel.findById(lessonId);
      console.log("Found lesson:", lesson);

      if (!lesson) throw { status: 404, message: "Lesson not found" };

      const slide = await SlideModel.create({
        title, 
        description, 
        text, 
        image: image || '',
        banner: banner || '', 
        footer: footer || '',  
        lesson: lessonId, 
        video
      });

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
        // Store the file path of the uploaded file.
        const filePath = req.file;

        // convert the PDF at the given path to text.
        const text = await processPdfFile(filePath);

        // Splits text into slides based on double line breaks and filters empty slides
        const slidesText = text.split('\n\n').filter(slideText => slideText.trim() !== '');
        
        // To find which lesson the slides should be created in (introduction, main, question)
        const lessonId = req.body.lessonId;

        /**
         * Converts slidesText into a slides using 'map()' and theirfor they will 
         * be created in the samme time which is more efficient than 'for' loop.
         * Each 'slideText' will extract title, description, and text, 
         * and a new slide is created in the database with the extracted information.
         */
        const slides = slidesText.map(async (slideText, index) => {
            // The first line of the slide text is treated as the title.
            const title = slideText.split('\n')[0];

            const description = title;

            // The rest of the slide text is treated as the text.
            const text = slideText.split('\n').slice(1).join('\n');

            // Create a new slide document with the extracted title and text, lesson ID and the order (i+1).
            return await SlideModel.create({ title, text, description, lesson: lessonId, order: index + 1 });
        })

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

  
  // automaticly update the order of the slides in the array to show them in correct order compared to their slide index
  async UpdateAllSlideOrder(req, res, next) {
    try {
      const { slideOrders } = req.body; // slideOrders er et array af objekter med { slideId, newOrder }
  
      // Brug en loop eller en bulk-operation for at opdatere hvert slide
      for (const slideOrder of slideOrders) {
        const { slideId, newOrder } = slideOrder;
        await SlideModel.findByIdAndUpdate(slideId, { order: newOrder });
      }
  
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Slides order updated successfully",
      });
  
    } catch (error) {
      next(error);
    }
  }

  // Retrieves slides by their Course ID
  async getSlidesByCourse(req, res, next) {
    try {
      const { courseId } = req.params;
  
      // Retrieve all lessons associated with the specified course
      const lessons = await LessonModel.find({ course: courseId });
  
  
      // Retrieve all slides for the found lessons
      const slides = await SlideModel.find({ lesson: { $in: lessons.map(lesson => lesson._id) } }).sort({ order: 1 });
  
      if (!slides.length) {
        return res.status(404).json({
          status: 404,
          success: false,
          message: "No slides found for this course"
        });
      }
  
      return res.status(200).json({
        status: 200,
        success: true,
        slides
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

      // Update Image-URL
      slide.image = createLinkForFiles(slide.image, req);

      // Update Banner-URL
      slide.banner = createLinkForFiles(slide.banner, req);

      // Update Footer-URL
      slide.footer = createLinkForFiles(slide.footer, req);

      // Update Video-URL
      slide.video = createLinkForFiles(slide.video, req);

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

  /* console.log('Request Body:', req.body);
  console.log('Request Params:', req.params);
  console.log('Request Files:', req.files);  */
  
  try {
    const slideId = req.params.slideId;
    const data = { ...req.body };

    // Remove unwanted or invalid fields from the data object
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
      const slideId = req.params.slideId;  
      const owner = req.user._id;
      const { imageWidthPercent } = req.body;

      // Validate if the slide belongs to the user
      const slide = await SlideModel.findOne({ _id: slideId, owner }); 
      if (!slide) throw { status: 404, message: "Slide not found or user not authorized" };

      if (req.files && req.files.image && req.files.image.name) {
          // If a new image is provided, update the slide's image path
          const imagePath = req.body.image;
          slide.image = imagePath;
      } else {
          // If no new image (when delete), set slide image to empty string
          slide.image = '';
      }

      // Update the image width percentage
      slide.imageWidthPercent = imageWidthPercent;

      // Save the updated slide information
      const updatedSlide = await slide.save();

      // Return the updated slide in the response
      return res.status(200).json({
          status: 200,
          success: true,
          message: "Slide image updated successfully",
          slide: updatedSlide,
      });

  } catch (error) {
      console.error("Caught an error: ", error);
      next(error);
  }
}


  async updateSlideBanner(req, res, next) {
    try {
        /* console.log("Params: ", req.params);
        console.log("User: ", req.user);
        console.log("Files: ", req.file); */
        
        const slideId = req.params.slideId;
        const owner = req.user._id;

        const slide = await SlideModel.findOne({ _id: slideId, owner });
        if (!slide) throw { status: 404, message: "Slide not found or user not authorized" };

        if (!req.files || !req.files.banner || !req.files.banner.name) throw { status: 400, message: "No banner file provided" };

        const bannerPath = req.body.banner;

        const updatedSlide = await SlideModel.findByIdAndUpdate(
            slideId,
            { $set: { banner: bannerPath } },
            { new: true }
        );

        console.log("Updated Slide: ", updatedSlide);

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Slide banner updated successfully",
            slide: updatedSlide,
        });

    } catch (error) {
        console.error("Caught an error: ", error);
        next(error);
    }
  }


  async updateSlideFooter(req, res, next) {
    try {
        /* console.log("Params: ", req.params);
        console.log("User: ", req.user);
        console.log("Files: ", req.files); */
        
        const slideId = req.params.slideId;
        const owner = req.user._id;

        const slide = await SlideModel.findOne({ _id: slideId, owner });
        if (!slide) throw { status: 404, message: "Slide not found or user not authorized" };

        if (!req.files || !req.files.footer || !req.files.footer.name) throw { status: 400, message: "No footer file provided" };

        const footerPath = req.body.footer;

        const updatedSlide = await SlideModel.findByIdAndUpdate(
            slideId,
            { $set: { footer: footerPath } },
            { new: true }
        );

        console.log("Updated Slide: ", updatedSlide);

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Slide footer updated successfully",
            slide: updatedSlide,
        });

    } catch (error) {
        console.error("Caught an error: ", error);
        next(error);
    }
  }


  async updateSlideVideo(req, res, next) {
    try {
        const slideId = req.params.slideId;  
        const owner = req.user._id;
        
        // Validate if the slide belongs to the user
        const slide = await SlideModel.findOne({ _id: slideId, owner }); 
        if (!slide) throw { status: 404, message: "Slide not found or user not authorized" };
        
        if (req.files && req.files.video && req.files.video.name) {
          const videoPath = req.body.video;
          slide.video = videoPath;
        } else {
            // If no new video (video deleted), set slide.video to an empty string
            slide.video = '';
        }

        /* // Log the validated video path
        console.log("Validated video path: ", req.body.video); */
        
        // Update the slide video in the database
        const updatedSlide = await slide.save();

        // Log the updated slide object
        console.log("Updated Slide: ", updatedSlide);
        
        // Return success message with the updated slide
        return res.status(200).json({
            status: 200,
            success: true,
            message: "Slide video updated successfully",
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
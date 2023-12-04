const autoBind = require("auto-bind");
const { CourseModel } = require("../models/course");
const { createLinkForFiles } = require("../modules/functions");
const { LessonModel } = require("../models/lesson");


/**
 * This is the controller for handling course related operations
 * class CourseController
 */
class CourseController {
  constructor() {
    autoBind(this);
  }

  /**
   * Creates default lessons for a newly created course
   * method - createDefaultlessons
   * @param {string} courseId - The ID of the course to create lessons for
  */

  async createDefaultLessons(courseId) {

    // Define default lessons as an array of strings
    const defaultLessons = ["Introduction", "Main", "Question"];

    // Loop through default lessons using Array.entries() method to get the index and value
    for (const [index, title] of defaultLessons.entries()) {
      const newlesson = new LessonModel({
        title: title,
        course: courseId,
        order: index,
      });

    // Save the new lesson to the database and get its ID
    await newlesson.save();

    }
  }

  /**
   * Creates a new course
   * method - createCourse
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @param {Function} next - The next middleware function
  */

  async createCourse(req, res, next) {

    // Check if user is authenticated
    if (!req.user) {
      return next({ status: 400, message: "User is not authenticated" });
    }

    try {
      console.log("Request Body:", req.body);
      console.log("Request Files:", req.files);

      const { title, description, image, private: isPrivate } = req.body;

      let tags = req.body.tags ? JSON.parse(req.body.tags) : [];
      
      console.log(tags);

      const owner = req.user._id
      console.log('req.params:', req.params);
      const catalog = req.params.catalogID;

      if (!title || !description || !image || !tags || !catalog) {
        throw {status: 400, message: "Missing required course data"};
      }

      // create new course
      const result = await CourseModel.create({title, description, owner, image, tags, private: isPrivate, catalog});

      // check if the course was created successfully
      if (!result)throw {
        status: 400, 
        message: "Adding the course encountered a problem",
      };

      // Create default lessons for the course
      await this.createDefaultLessons(result._id);

      // return success message
      return res.status(201).json({
        status : 201, 
        success: true, 
        message : 'The course was successfully created'
      })
    } 
    catch (error) { console.error(error);
      console.error('Error:', error.message, error.status);
      // if there is any error, it goes to the error handling middleware
      next(error);
    }
  }


  /**
   * Gets all courses for the current user
   * method - getAllCourse
   * @param {Object} req - The request object
   * @param {Object} res - The response object
  */

  async getAllCourse(req, res, next) {
    try {
      const catalogID = req.params.catalogID;

      if (!catalogID) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "No catalogID provided."
        });
      }
      
      const courses = await CourseModel.find({ catalog: catalogID }); 

      // Update image link for each course
      for (const course of courses) {
        course.image = createLinkForFiles(course.image, req);
      }

      // Send response with courses
      return res.status(200).json({
        status: 200,
        success: true,
        courses,
      });
    } catch (error) {
      next(error);
    }
  }


  /**
   * Returns the lessons for one course by the course ID 
   * method - getlessonsByCourseId
   */

  async getLessonsByCourseId(req, res) {

    try {
      const courseId = req.params.courseId;
      const lessons = await LessonModel.find({ course: courseId }).sort({ order: 1 });
      res.status(200).json(lessons);
      
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


  /**
   * Finds a course by ID for the current user
   * method - findCourse
   * @param {string} courseID - The ID of the course to find
   * @param {string} owner - The ID of the user who owns the course
   * returns Object - The course found
   * throws Object - An error if the course is not found
   */

  async findCourse(courseID, owner) {

    // Search for the course with given courseID and owner
    const course = await CourseModel.findOne({ owner, _id: courseID });

    // If course not found, throw an error
    if (!course) throw { status: 404, message: "No course was found" };

    // Return the found course
    return course;

  }


  /**
   * Gets a course by ID for the current user
   * method - getCourseById
   * @param {Object} req - The request object
   * @param {Object} res - The response object
  */

  async getCourseById(req, res, next) {
    try {

      const owner = req.user._id; // Get the owner of the course from the request object
      const courseID = req.params.id; // Get the ID of the course from the request parameters
      const course = await this.findCourse(courseID, owner); // Find the course with the specified ID and owner

      // Generate a link for the course image using the createLinkForFiles() function
      course.image = createLinkForFiles(course.image, req); 

      return res.status(200).json({
        status: 200,
        success: true,
        course, // Return the course object in the response
      });
      
    } catch (error) {
      console.log(error);
      next(error);
    }
  }



 /**
   * Gets a course by any property
   * method - searchCourses
   * @param {Object} req - The request object
   * @param {Object} res - The response object
  */
async searchCourses(req, res, next) {
    try {
        const value = req.params.value;

        const courses = await CourseModel.find({ 
            $or: [
                { "title": { $regex: value, $options:'i' } },
                { "description": { $regex: value, $options:'i' } },
                { "tags": { $regex: value, $options:'i' } }
            ]
        });

        if (!courses) {
            throw {
                status: 404,
                message: "No courses found",
            };
        }

        // Update image link for each course
        for (const course of courses) {
            course.image = createLinkForFiles(course.image, req);
        }

        return res.status(200).json({
            status: 200,
            success: true,
            courses,
        });
    } catch (error) {
        next(error);
    }
}



  /**
   * Remove a course by ID for a user
   * method - course
   * @param {Object} req - The request object
   * @param {Object} res - The response object
  */

  async removeCourse(req, res, next) {
    try {

      const owner = req.user._id;
      const courseID = req.params.id;

      // Check if the course belongs to the user
      await this.findCourse(courseID, owner);

      // Delete the lessons associated with the course
      const deleteLessonsResult = await LessonModel.deleteMany({
        course: courseID,
      });

      // Delete the course from the database
      const deleteCourseResult = await CourseModel.deleteOne({
        _id: courseID,
      });

      // Check if the course was successfully deleted
      if (deleteCourseResult.deletedCount == 0)
        throw { status: 400, message: "The course was not deleted" };

      // Return success message
      return res.status(200).json({
        status: 200,
        success: true,
        message: "The course and associated lessons were successfully deleted",
      });

    } catch (error) {
      next(error);
    }
  }


  /**
   * Update a course by ID for a user
   * method - updateCourse
   * @param {Object} req - The request object
   * @param {Object} res - The response object
  */

  async updateCourse(req, res, next) {
    try {
      console.log('Request body:', req.body);
      console.log('Request params:', req.params);
      const owner = req.user._id;
      const courseID = req.params.id;

      // Check if the course belongs to the user
      const course = await this.findCourse(courseID, owner);

      // Extract data from request body
      const data = { ...req.body };

      // Remove unwanted fields from data
      Object.entries(data).forEach(([key, value]) => {
       
        if (!["title", "description", "tags", "private", "catalog"].includes(key)) delete data[key];
        if (["", " ", 0, null, undefined, NaN].includes(value))
          delete data[key];
        if (key == "tags" && data["tags"].constructor === Array) {
          data["tags"] = data["tags"].filter((val) => {
            if (!["", " ", 0, null, undefined, NaN].includes(val)) return val;
          });
          if (data["tags"].length == 0) delete data["tags"];
        }
        // Convert the private value to a boolean
        if (key == "private" && typeof value === "string") {
          data["private"] = value.toLowerCase() === "true";
        }
      });

      // Update the course in the database
      const updateResult = await CourseModel.updateOne(
        { _id: courseID },
        { $set: data }
      );
      console.log('Update result:', updateResult);

      // Check if the course was successfully updated
      if (updateResult.modifiedCount == 0)
        throw { status: 400, message: "The update was not successful" };

      // Return success message
      return res.status(200).json({
        status: 200,
        success: true,
        message: "The update was successful",
      });

    } catch (error) {
      next(error);
    }
  }


  /**
   * Update a courseImage by ID for a user
   * method - updateCourseImage
   * @param {Object} req - The request object
   * @param {Object} res - The response object
  */

  async updateCourseImage(req, res, next) {
    try {
      const { image } = req.body;
      const owner = req.user._id;
      const courseID = req.params.id;
      
      // Check if the course belongs to the user
      await this.findCourse(courseID, owner);

      // Update the course image in the database
      const updateResult = await CourseModel.updateOne(
        { _id: courseID },
        { $set: { image } }
      );
      console.log('What do we get after update:', updateResult);
      
      // Check if the course image was successfully updated
      if (updateResult.modifiedCount == 0)
        throw { status: 400, message: "The update was not successful" };

      // Return success message
      return res.status(200).json({
        status: 200,
        success: true,
        message: "The update was successful",
      });

    } catch (error) {
      console.log("Caught an error: ", error);
      next(error);
    }
  }

  getAllCourseOfTeam() {}
  getCourseOfUser() {}
}

module.exports = {
  CourseController: new CourseController(),
};

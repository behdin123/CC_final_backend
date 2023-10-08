/**
 * This file defines a Mongoose schema for a 'lesson' document.
 * The schema has three properties: 'title', 'course', and 'order', all of which are required. 
 * The 'course' property is a reference to the course to which the lesson belongs.
 */

// Import Mongoose library
const mongoose = require("mongoose");

// Define a new Mongoose schema for lessons
const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // Lessons title field
    course: { type: mongoose.Types.ObjectId, required: true }, // Reference to the parent course's ObjectId
    order: { type: Number, required: true } // Order of the lessons in the course
  },
  {
    timestamps: true,
  }
);

// Create a new Mongoose model using the lessonSchema
const LessonModel = mongoose.model("lesson", lessonSchema);

module.exports = {
  LessonModel,
};
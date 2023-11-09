const mongoose = require("mongoose");

const SlideSchema = new mongoose.Schema(
  {
    lesson: { type: mongoose.Types.ObjectId, ref: "lesson", required: true },
    title: { type: String},
    description: { type: String, default: "" },
    banner : {type : String},
    image : {type : String},
    imageWidthPercent: { type: Number },
    video: { type: String},
    footer: { type: String},
    text: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const SlideModel = mongoose.model("slide", SlideSchema);

module.exports = {
  SlideModel,
};
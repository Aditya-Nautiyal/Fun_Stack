const mongoose = require("mongoose");

// Defining the schema for ScoreForFour
// This schema will be used to create a model for the ScoreForFour collection in MongoDB
const ScoreSchema = new mongoose.Schema({
  email: String,
  score: String,
});

const ScoreModel = mongoose.model("ScoreForFour", ScoreSchema, "scoreForFour");
module.exports = ScoreModel;
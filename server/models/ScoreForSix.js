const mongoose = require("mongoose");

// Defining the schema for ScoreForSix
// This schema will be used to create a model for the ScoreForFour collection in MongoDB
const ScoreSchema = new mongoose.Schema({
  email: String,
  score: String,
});

const ScoreModel = mongoose.model("ScoreForSix", ScoreSchema, "scoreForSix");
module.exports = ScoreModel;

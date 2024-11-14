const mongoose = require("mongoose");

const ScoreSchema = new mongoose.Schema({
  email: String,
  score: String,
});

const ScoreModel = mongoose.model("ScoreForFour", ScoreSchema, "scoreForFour");
module.exports = ScoreModel;
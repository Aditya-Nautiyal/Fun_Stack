const mongoose = require("mongoose");

const ScoreSchema = new mongoose.Schema({
  email: String,
  score: String,
});

const ScoreModel = mongoose.model("Score", ScoreSchema, "score");
module.exports = ScoreModel;
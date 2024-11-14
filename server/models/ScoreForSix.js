const mongoose = require("mongoose");

const ScoreSchema = new mongoose.Schema({
  email: String,
  score: String,
});

const ScoreModel = mongoose.model("ScoreForSix", ScoreSchema, "scoreForSix");
module.exports = ScoreModel;

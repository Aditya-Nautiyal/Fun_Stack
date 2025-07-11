require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const EmployeeModel = require("./models/Employee.js");
const ScoreModelForFour = require("./models/ScoreForFour.js");
const ScoreModelForSix = require("./models/ScoreForSix.js");
const authenticate = require("./middlewares/authenticate.js");

const {
  REGISTRATION_SUCCESS,
  USER_EXISTED,
  RECORD_NOT_FOUND,
  INCORRECT_PASSWORD,
  LOGIN_SUCCESS,
  SERVER_RUNING,
  EMAIL_CRITERIA_NOT_MEET,
  PASSWORD_CRITERIA_NOT_MEET,
  CONGRATULATIONS_HIGH_SCORE,
  CONGRATULATIONS,
  INTERNAL_SERVER_ERROR,
  TOKEN_CREATION_FALIED,
} = require("./constants/string.js");
const { DEFAULT_SUCCESS, DEFAULT_ERROR } = require("./constants/codes.js");
const {
  validateEmail,
  validatePassword,
  generateToken,
} = require("./utility/commonFunction.js");
const path = require("path");

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());
app.use(cors());

// Determine the MongoDB URI based the on environments
const mongoURI =
  process.env.NODE_ENV === "production"
    ? process.env.MONGODB_PROD_URI
    : process.env.MONGODB_LOCAL_URI;

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  EmployeeModel.findOne({ email: email }).then((user) => {
    if (user) {
      if (user.password === password) {
        let token;
        try {
          token = generateToken(user);
        } catch (e) {
          return res.json({
            statusCode: DEFAULT_ERROR,
            desc: TOKEN_CREATION_FALIED,
          });
        }
        res.json({
          statusCode: DEFAULT_SUCCESS,
          desc: LOGIN_SUCCESS,
          token: token,
        });
      } else {
        res.json({
          statusCode: DEFAULT_ERROR,
          desc: INCORRECT_PASSWORD,
        });
      }
    } else {
      res.json({
        statusCode: DEFAULT_ERROR,
        desc: RECORD_NOT_FOUND,
      });
    }
  });
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);

  if (emailValidation) {
    return res.json({
      statusCode: DEFAULT_ERROR,
      desc: EMAIL_CRITERIA_NOT_MEET,
    });
  }

  if (
    !passwordValidation.hasUpperCase ||
    !passwordValidation.hasNumber ||
    !passwordValidation.hasSpecialChar ||
    !passwordValidation.hasMinLength
  ) {
    return res.json({
      statusCode: DEFAULT_ERROR,
      desc: PASSWORD_CRITERIA_NOT_MEET,
    });
  }
  EmployeeModel.findOne({ email: email })
    .then((user) => {
      if (user) {
        return res.json({
          statusCode: DEFAULT_ERROR,
          desc: USER_EXISTED,
        });
      } else {
        EmployeeModel.create(req.body)
          .then(() =>
            res.json({
              statusCode: DEFAULT_SUCCESS,
              desc: REGISTRATION_SUCCESS,
            })
          )
          .catch((err) => res.json(err));
      }
    })
    .catch((err) => res.json(err));
});

app.post("/submitScore", authenticate, async (req, res) => {
  const { email, score, matrixSize } = req.body;
  try {
    const Model = matrixSize === "4" ? ScoreModelForFour : ScoreModelForSix;
    // Fetch all scores for the provided email
    const userScores = await Model.find({ email }).sort({ score: -1 }); // Sort descending by score

    if (userScores.length < 10) {
      // If less than 10 scores, add the new score
      const newScore = new Model({ email, score });
      await newScore.save();
      return res.json({
        statusCode: DEFAULT_SUCCESS,
        desc: CONGRATULATIONS_HIGH_SCORE,
      });
    }

    // Check if the score is in the top 10
    const lowestTopScore = Number(userScores[9].score); // Lowest score among the top 10
    const numericScore = Number(score);
    if (numericScore > lowestTopScore) {
      // If new score qualifies, remove the lowest score and add the new one
      await Model.findOneAndDelete({ _id: userScores[9]._id });
      const newScore = new Model({ email, score });
      await newScore.save();
      return res.json({
        statusCode: DEFAULT_SUCCESS,
        desc: CONGRATULATIONS_HIGH_SCORE,
      });
    } else {
      return res.json({
        statusCode: DEFAULT_SUCCESS,
        desc: CONGRATULATIONS,
      });
    }
  } catch (error) {
    console.error(error);
    return res.json({
      statusCode: DEFAULT_ERROR,
      desc: INTERNAL_SERVER_ERROR,
    });
  }
});

app.post("/getHighScore", authenticate, async (req, res) => {
  const { matrixSize } = req.body;
  try {
    const Model = matrixSize === "4" ? ScoreModelForFour : ScoreModelForSix;
    const users = await Model.find({}).select("email score -_id");
    return res.json({
      statusCode: DEFAULT_SUCCESS,
      list: users,
    });
  } catch (error) {
    return res.json({
      statusCode: DEFAULT_ERROR,
      desc: INTERNAL_SERVER_ERROR,
    });
  }
});

app.post("/refresh-token", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
    const newAccessToken = generateToken(decoded)?.accessToken;

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
});

app.use(express.static("../client/dist"));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "client", "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(SERVER_RUNING);
});

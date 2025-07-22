require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { db } = require("./firebaseAdmin");
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
  REFRESH_TOKEN_REQUIRED,
  INVALID_EXPIRED_TOKEN
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
const mongoURI = process.env.MONGODB_URI;

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
    const collectionName = matrixSize === "4" ? "scoreForFour" : "scoreForSix";
    const scoresRef = db.collection(collectionName);

    // Get all scores for this user, sorted by score DESC
    const snapshot = await scoresRef
      .where("email", "==", email)
      .orderBy("score", "desc")
      .get();

    const userScores = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const numericScore = Number(score);

    if (userScores.length < 10) {
      // Less than 10 scores, add new one
      await scoresRef.add({ email, score: numericScore });
      return res.json({
        statusCode: DEFAULT_SUCCESS,
        desc: CONGRATULATIONS_HIGH_SCORE,
      });
    }

    const lowestTopScore = userScores[9].score;

    if (numericScore > lowestTopScore) {
      // Replace lowest score with new one
      await scoresRef.doc(userScores[9].id).delete();
      await scoresRef.add({ email, score: numericScore });
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

//Not using this endpoint, but keeping it for future use
app.post("/getHighScore", authenticate, async (req, res) => {
  const { matrixSize } = req.body;
  try {
    const collectionName = matrixSize === "4" ? "scoreForFour" : "scoreForSix";
    const scoresRef = db.collection(collectionName);

    const snapshot = await scoresRef.get();
    const users = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        email: data.email,
        score: data.score,
      };
    });

    return res.json({
      statusCode: DEFAULT_SUCCESS,
      list: users,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      statusCode: DEFAULT_ERROR,
      desc: INTERNAL_SERVER_ERROR,
    });
  }
});

app.post("/refresh-token", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: REFRESH_TOKEN_REQUIRED });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
    const newAccessToken = generateToken(decoded)?.accessToken;

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    return res
      .status(403)
      .json({ message: INVALID_EXPIRED_TOKEN });
  }
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use(express.static("../client/dist"));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "client", "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(SERVER_RUNING);
});

# 🎮 FunStack

FunStack is a full-stack game application featuring user authentication, score submission, and a real-time leaderboard. It uses:

- **Frontend**: React (Vite), deployed on **AWS Amplify**
- **Backend**: Node.js with Express, deployed on **Render**
- **Database**: MongoDB for user data & Firebase Firestore for real-time high scores
- **Authentication**: JSON Web Tokens (JWT)

# Start the Frontend

Navigate to the client folder, install dependencies, and run the app:

- cd client
- npm install
- npm run dev

# Start the Backend

Navigate to the server folder and run:

- cd server
- npm install
- npm install --save-dev nodemon
- npx nodemon index.js

# ⚙️ Environment Variables

Make sure to create a `.env` file in `client` and `.env.development`in `server`folders.

# ☁️ Deployment

- Frontend: Deployed on [AWS Amplify](https://main.d10rdlhirhiynh.amplifyapp.com/)
- Backend: Deployed on [Render](https://fun-stack-server.onrender.com)

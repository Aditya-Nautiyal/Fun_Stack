const mongoose = require("mongoose");

// Friendship schema for friend requests and relationships
const FriendshipSchema = new mongoose.Schema({
  requester: { type: String, required: true }, // email of sender
  recipient: { type: String, required: true }, // email of receiver
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const FriendshipModel = mongoose.model("Friendship", FriendshipSchema, "friendships");
module.exports = FriendshipModel;

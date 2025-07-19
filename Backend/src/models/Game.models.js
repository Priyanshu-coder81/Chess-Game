import mongoose from "mongoose";

const moveSchema = new mongoose.Schema(
  {
    san: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      enum: ["white", "black"],
      required: true,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
    fen: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const gameSchema = new mongoose.Schema(
  {
    whitePlayer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blackPlayer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    moves: [moveSchema], // Embedded here!
    result: {
      type: String,
      enum: ["white", "black", "draw", "aborted"],
      default: "aborted",
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Game = mongoose.model("Game", gameSchema);

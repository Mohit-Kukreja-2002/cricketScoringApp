import mongoose, { Schema } from "mongoose";

const PlayerStats = new Schema({
    name: { type: String, required: true },
    runs: { type: Number, default: 0 },
    ballsFaced: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    isOut: { type: Boolean, default: false },

    overs: { type: Number, default: 0 },
    runsConceded: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    extras: { type: Number, default: 0 },
});


const MatchSchema = new Schema(
    {
        team1: { type: String, required: true },
        team2: { type: String, required: true },
        overs: { type: Number, required: true },
        team1Players: [PlayerStats],
        team2Players: [PlayerStats],
        team1Score: { type: String, default: "0/0" }, // runs/wickets
        team2Score: { type: String, default: "0/0" },
        team1Extras: { type: Number, default: 0 }, // Extra runs (wides, no-balls, byes, leg-byes)
        team2Extras: { type: Number, default: 0 },
        currentInning: { type: Number, default: 1 },
        currentOver: { type: Number, default: 0 },
        currentBall: { type: Number, default: 0 },
        currentBatsman: { type: String },
        nonStriker: { type: String },
        currentBowler: { type: String },
        status: { type: String, enum: ["Not Started", "In Progress", "Completed"], default: "Not Started" },
        commentary: { type: [String], default: [] },
    },
    { timestamps: true }
);

export default mongoose.models.Match || mongoose.model("Match", MatchSchema);

const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  phase: {
    type: String,
  },
  group: {
    type: String,
  },
  ranking: {
    type: Number,
    required: true,
  },
  teamName: {
    type: String,
  },
  smallTeamName: {
    type: String,
  },
  teamLogo: { type: String },
  matchesPlayed: {
    type: Number,
  },
  winnedMatches: {
    type: Number,
  },
  lostMatches: {
    type: Number,
  },
  pts: {
    type: Number,
  },
});

module.exports = mongoose.model("standings", teamSchema);

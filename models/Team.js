const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  salary: {
    type: Number,
    required: true
  }
});

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  players: [playerSchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;

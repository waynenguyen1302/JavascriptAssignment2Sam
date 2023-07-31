const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

router.get('/teams/:teamId/players/:playerId/edit', async (req, res) => {
  const { teamId, playerId } = req.params;

  try {
    const team = await Team.findOne({ _id: teamId, user: req.session.user._id });
    const player = team.players.id(playerId);
    res.render('edit-player', { team, player });
  } catch (error) {
    req.flash('error', 'Failed to find player');
    res.redirect('/dashboard');
  }
});

router.post('/teams/:teamId/players/:playerId/edit', async (req, res) => {
  const { teamId, playerId } = req.params;
  const { name, position, salary } = req.body;

  try {
    const team = await Team.findOne({ _id: teamId, user: req.session.user._id });
    const player = team.players.id(playerId);
    player.name = name;
    player.position = position;
    player.salary = salary;
    await team.save();
    req.flash('success', 'Player updated successfully');
    res.redirect('/dashboard');
  } catch (error) {
    req.flash('error', 'Failed to update player');
    res.redirect('/dashboard');
  }
});


router.post('/teams/:teamId/players/:playerId/delete', async (req, res) => {
  if (!req.session.user) {
    req.flash('error', 'You need to log in first');
    return res.redirect('/login');
  }

  const { teamId, playerId } = req.params;

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      req.flash('error', 'Team not found');
      return res.redirect('/dashboard');
    }

    team.players.id(playerId).remove();
    await team.save();

    req.flash('success', 'Player deleted successfully');
    res.redirect('/dashboard');
  } catch (error) {
    req.flash('error', 'Failed to delete player');
    res.redirect('/dashboard');
  }
});

module.exports = router;
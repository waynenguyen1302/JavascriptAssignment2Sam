const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

// Middleware to check if the user is authenticated
function requireAuthentication(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    req.flash('error', 'You need to log in first');
    return res.redirect('/login');
  }
}

// Dashboard route
router.get('/dashboard', requireAuthentication, async (req, res) => {
  try {
    const teams = await Team.find({ user: req.session.user });
    res.render('dashboard', { teams });
  } catch (error) {
    req.flash('error', 'Failed to fetch teams');
    res.redirect('/');
  }
});

// Create team
router.post('/dashboard/teams', requireAuthentication, async (req, res) => {
  const { name } = req.body;
  const team = new Team({ name, user: req.session.user });

  try {
    await team.save();
    req.flash('success', 'Team created successfully');
    res.redirect('/dashboard');
  } catch (error) {
    req.flash('error', 'Failed to create team');
    res.redirect('/dashboard');
  }
});

// Add player
router.post('/dashboard/teams/:teamId/players', requireAuthentication, async (req, res) => {
  const { teamId } = req.params;
  const { name, position, salary } = req.body;

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      req.flash('error', 'Team not found');
      return res.redirect('/dashboard');
    }

    team.players.push({ name, position, salary });
    await team.save();

    req.flash('success', 'Player added successfully');
    res.redirect('/dashboard');
  } catch (error) {
    req.flash('error', 'Failed to add player');
    res.redirect('/dashboard');
  }
});

// Update player
router.post('/dashboard/teams/:teamId/players/:playerId/update', requireAuthentication, async (req, res) => {
  const { teamId, playerId } = req.params;
  const { name, position, salary } = req.body;

  try {
    const team = await Team.findOneAndUpdate(
      { _id: teamId, 'players._id': playerId },
      {
        $set: {
          'players.$.name': name,
          'players.$.position': position,
          'players.$.salary': salary,
        },
      },
      { new: true }
    );

    if (!team) {
      req.flash('error', 'Team or player not found');
      return res.redirect('/dashboard');
    }

    req.flash('success', 'Player updated successfully');
    res.redirect('/dashboard');
  } catch (error) {
    req.flash('error', 'Failed to update player');
    res.redirect('/dashboard');
  }
});

module.exports = router;

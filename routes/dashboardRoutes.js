const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

// Dashboard route
router.get('/dashboard', async (req, res) => {
  try {
    const teams = await Team.find({ user: req.session.user });
    res.render('dashboard', { teams });
  } catch (error) {
    req.flash('error', 'Failed to fetch teams');
    res.redirect('/');
  }
});

// Create team
router.post('/dashboard/teams', async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.user) {
    req.flash('error', 'You need to log in first');
    return res.redirect('/login');
  }

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
router.post('/dashboard/teams/:teamId/players', async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.user) {
    req.flash('error', 'You need to log in first');
    return res.redirect('/login');
  }

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
router.post('/dashboard/teams/:teamId/players/:playerId/update', async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.user) {
    req.flash('error', 'You need to log in first');
    return res.redirect('/login');
  }

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

// // Delete player
// router.post('/dashboard/teams/:teamId/players/:playerId/delete', async (req, res) => {
//   // Check if the user is authenticated
//   if (!req.session.user) {
//     req.flash('error', 'You need to log in first');
//     return res.redirect('/login');
//   }

//   const { teamId, playerId } = req.params;

//   try {
//     const team = await Team.findByIdAndUpdate(
//       teamId,
//       { $pull: { players: { _id: playerId } } },
//       { new: true }
//     );

//     if (!team) {
//       req.flash('error', 'Team or player not found');
//       return res.redirect('/dashboard');
//     }

//     req.flash('success', 'Player deleted successfully');
//     res.redirect('/dashboard');
//   } catch (error) {
//     req.flash('error', 'Failed to delete player');
//     res.redirect('/dashboard');
//   }
// });

module.exports = router;

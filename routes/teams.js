const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

// Create a team
router.post('/teams', async (req, res) => {
  const { teamName } = req.body;

  try {
    const newTeam = await Team.create({ name: teamName, user: req.session.user._id });
    req.flash('success', 'Team created successfully');
    res.redirect('/dashboard');
  } catch (error) {
    req.flash('error', 'Failed to create team');
    res.redirect('/dashboard');
  }
});

// Delete a team
router.post('/teams/:id/delete', async (req, res) => {
  const { id } = req.params;

  try {
    await Team.findOneAndDelete({ _id: id, user: req.session.user._id });
    req.flash('success', 'Team deleted successfully');
    res.redirect('/dashboard');
  } catch (error) {
    req.flash('error', 'Failed to delete team');
    res.redirect('/dashboard');
  }
});

// Edit a team
router.get('/teams/:id/edit', async (req, res) => {
  const { id } = req.params;

  try {
    const team = await Team.findOne({ _id: id, user: req.session.user._id });
    res.render('edit-team', { team });
  } catch (error) {
    req.flash('error', 'Failed to find team');
    res.redirect('/dashboard');
  }
});

router.post('/teams/:id/edit', async (req, res) => {
  const { id } = req.params;
  const { teamName } = req.body;

  try {
    await Team.findOneAndUpdate({ _id: id, user: req.session.user._id }, { name: teamName });
    req.flash('success', 'Team updated successfully');
    res.redirect('/dashboard');
  } catch (error) {
    req.flash('error', 'Failed to update team');
    res.redirect('/dashboard');
  }
});

// Add a player to a team
router.post('/teams/:teamId/players', async (req, res) => {
  const { teamId } = req.params;
  const { name, position, salary } = req.body;

  try {
    const team = await Team.findOne({ _id: teamId, user: req.session.user._id });
    team.players.push({ name, position, salary });
    await team.save();
    req.flash('success', 'Player added successfully');
    res.redirect('/dashboard');
  } catch (error) {
    req.flash('error', 'Failed to add player');
    res.redirect('/dashboard');
  }
});


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

//delete
router.get('/teams/:teamId/players/:playerId/delete', async (req, res) => {
  const { teamId, playerId } = req.params;

  try {
    const team = await Team.findOne({ _id: teamId, user: req.session.user._id });
    const player = team.players.id(playerId);
    res.render('delete-player', { team, player });
  } catch (error) {
    req.flash('error', 'Failed to find player');
    res.redirect('/dashboard');
  }
});

router.post('/teams/:teamId/players/:playerId/delete', async (req, res) => {
  const { teamId, playerId } = req.params;

  try {
    const team = await Team.findOne({ _id: teamId, user: req.session.user._id });
    const player = team.players.id(playerId);
    
    if (!player) {
      req.flash('error', 'Player not found');
      return res.redirect('/dashboard');
    }
    
    const confirmDelete = req.body.confirmDelete;
    if (confirmDelete === 'true') {
      player.remove();
      await team.save();
      req.flash('success', 'Player deleted successfully');
    } else {
      req.flash('info', 'Player deletion canceled');
    }

    res.redirect('/dashboard');
  } catch (error) {
    req.flash('error', 'Failed to delete player');
    res.redirect('/dashboard');
  }
});

module.exports = router;
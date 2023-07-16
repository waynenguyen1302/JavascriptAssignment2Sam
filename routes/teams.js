const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

// Create a team
router.post('/teams', async (req, res) => {
  const { teamName } = req.body;

  try {
    await Team.create({ name: teamName });
    req.flash('success', 'Team created successfully');
    res.redirect('/dashboard');
  } catch (error) {
    req.flash('error', 'Failed to create team');
    res.redirect('/dashboard');
  }
});

// Edit a team
router.get('/teams/:id/edit', async (req, res) => {
  const { id } = req.params;

  try {
    const team = await Team.findById(id);
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
    await Team.findByIdAndUpdate(id, { name: teamName });
    req.flash('success', 'Team updated successfully');
    res.redirect('/dashboard');
  } catch (error) {
    req.flash('error', 'Failed to update team');
    res.redirect('/dashboard');
  }
});

// Delete a team
router.post('/teams/:id/delete', async (req, res) => {
  const { id } = req.params;

  try {
    await Team.findByIdAndDelete(id);
    req.flash('success', 'Team deleted successfully');
    res.redirect('/dashboard');
  } catch (error) {
    req.flash('error', 'Failed to delete team');
    res.redirect('/dashboard');
  }
});

module.exports = router;

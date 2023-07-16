const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const mongoose = require('mongoose');
const config = require('./config');
const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect(`mongodb+srv://${config.username}:${config.password}@sjacksonjavascript.llzbx5b.mongodb.net/${config.database}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Failed to connect to MongoDB:', error));


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

// Register and login routes
const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teams');
const playerRoutes = require('./routes/players');
app.use(authRoutes);
app.use(teamRoutes);
app.use(playerRoutes);

// Set up your views engine and static files (assuming you're using a templating engine like Handlebars)
app.set('view engine', 'hbs');
app.use(express.static('public'));

// Home route
app.get('/', (req, res) => {
  res.render('home');
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  const players = []; // Fetch players from the database or any other data source
  const teams = []; // Fetch teams from the database or any other data source
  res.render('dashboard', { user: req.session.user, players, teams });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

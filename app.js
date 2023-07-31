const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const mongoose = require('mongoose');
const Handlebars = require("handlebars");
const fs = require('fs');
const path = require('path');

const config = require('./config'); // Assuming you have the config.js file with MongoDB connection details
const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teams');
const playerRoutes = require('./routes/players');

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

// Set up your views engine and static files
app.set('view engine', 'hbs');
app.use(express.static('public'));

// Register Handlebars Partials
const globalHeaderPath = path.join(__dirname, 'views', 'partials', 'global-header.hbs');
const globalHeaderTemplate = fs.readFileSync(globalHeaderPath, 'utf8');
Handlebars.registerPartial('global-header', globalHeaderTemplate);

// Register your routes
app.use(authRoutes);
app.use(teamRoutes);
app.use(playerRoutes);

// Home route
app.get('/', (req, res) => {
  res.render('home');
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const path = require('path');
const Listing = require('./models/listing.js');
const listingsRoutes = require('./routes/listing.js');
const reviewRoutes = require('./routes/review.js');
const userRoutes = require('./routes/user.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user.js');

const app = express();

// Middleware
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const dbUrl = process.env.ATLASDB_URL;

// Session store configuration
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SESSION_SECRET 
  },
  collectionName: 'sessions', // Explicitly name the collection
  ttl: 7 * 24 * 60 * 60, // 7 days in seconds (matches cookie maxAge)
  touchAfter: 24 * 3600, // Time period between updates
});

store.on("error", (err) => { // Added err parameter
  console.log("ERROR in mongo session store", err);
});

// Session options
const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET ,
  resave: false,
  saveUninitialized: false, // Changed to false for security
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Enable in production
    sameSite: 'lax' // Recommended for CSRF protection
  }
};

// Initialize session middleware (only once!)
app.use(session(sessionOptions)); // This should be your only session middleware
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Passport.js configuration
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to set local variables for success and error flash messages
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// MongoDB connection
mongoose.connect(process.env.ATLASDB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log('Connected to MongoDB!'))
.catch(err => console.error(`Error connecting to MongoDB: ${err}`));


// Routes for listings
app.use('/listings', listingsRoutes);

// Routes for reviews
app.use('/listings', reviewRoutes =>{
  console.log()
});

app.use('/', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('listings/error', { status: 500, message: 'Internal Server Error' });
});

// Start the server
// In app.js, find the app.listen(...) block
const PORT = process.env.PORT || 10000; // Use Render's PORT, or default to 10000 locally
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
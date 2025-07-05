const mongoose = require('mongoose');
const data = require('./data.js');
const Listing = require('../models/listing.js');

// Load environment variables in development
require('dotenv').config(); // Temporarily force dotenv to always load

// Use a fallback URL if ATLASDB_URL is not set
const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

const main = async () => {
    try {
        await mongoose.connect(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB!');
        await initDb(); // Only initialize DB after successful connection
    } catch (err) {
        console.error(`Error connecting to MongoDB: ${err}`);
        process.exit(1);
    }
};

const initDb = async () => {
    try {
        await Listing.deleteMany({});
        const ownerId = "661d3fde6a34be3e9467f44c";
        const listingsWithOwner = data.map(listing => ({ ...listing, owner: ownerId }));
        await Listing.insertMany(listingsWithOwner);
        console.log("Data was initialized!");
    } catch (error) {
        console.error("Initialization error:", error);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

main();
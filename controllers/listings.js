const Listing = require("../models/listing");
const Review = require("../models/review");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// listings.js or controllers/listings.js
module.exports.showallListings = async (req, res) => {
  try {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  } catch (error) {
    console.error("Error fetching listings:", error);
    req.flash("error", "Failed to fetch listings");
    return res.redirect("/listings"); // Correct: 'return' is here
  }
};

module.exports.createListing = async (req, res) => {
  try {
    const { title, description, price, location, country } = req.body;
    const { path, filename } = req.file;

    // Send request to Mapbox Geocoding API
    const response = await geocodingClient
      .forwardGeocode({
        query: `${location}, ${country}`,
        limit: 1,
      })
      .send();

    // Extract coordinates from the geocoding response
    const coordinates = response.body.features[0].geometry.coordinates;

    // Create new listing with geocoding data
    const newListing = new Listing({
      title,
      description,
      price,
      location,
      country,
      geometry: {
        type: "Point",
        coordinates,
      },
      image: { url: path, filename },
      owner: req.user._id,
    });

    // Save the new listing
    await newListing.save();

    // In createListing function (example)
    req.flash("success", "New Listing Created!");
    return res.redirect(`/listings/${newListing._id}`); // Correct: 'return' is here
  } catch (error) {
    console.error("Error creating listing:", error);
    req.flash("error", "Failed to create listing");
    return res.redirect("/listings"); // Correct: ADDED 'return' here
  }
};

// In your listings.js or controllers/listings.js file

module.exports.showspecificListing = async (req, res) => {
  const { id } = req.params;
  // Populate the 'owner' field to get the full user object
  // Also populate 'reviews' and, for each review, populate its 'author'
  const listing = await Listing.findById(id)
    .populate("owner")
    .populate({
      path: "reviews",
      populate: {
        path: "author", // Populate the author field within each review
      },
    });

if (!listing) {
  return res.status(404).send("Listing not found");
}
if (!listing.owner) {
  listing.owner = { username: "Unknown" }; // Default value
}
res.render("listings/show", { listing });
};

module.exports.renderEditForm = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    // Added check: If listing is not found, redirect and flash error
    if (!listing) {
        req.flash("error", "Listing not found to edit!");
        return res.redirect("/listings");
    }
    res.render("listings/edit", { listing });
  } catch (error) {
    console.error("Error rendering edit form:", error);
    req.flash("error", "Failed to render edit form");
    return res.redirect("/listings"); // Correct: ADDED 'return' here
  }
};

module.exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, location, country, imageUrl } = req.body;

    // Send request to Mapbox Geocoding API
    const response = await geocodingClient
      .forwardGeocode({
        query: `${location}, ${country}`,
        limit: 1,
      })
      .send();

    // Extract coordinates from the geocoding response
    const coordinates = response.body.features[0].geometry.coordinates;

    // Update listing with new data
    let listing = await Listing.findByIdAndUpdate(id, {
      title,
      description,
      price,
      location,
      country,
      imageUrl,
      geometry: {
        type: "Point",
        coordinates,
      },
    });

    req.flash("success", "Listing Updated");
    return res.redirect(`/listings/${id}`); // Changed to redirect to the updated listing's show page
  } catch (error) {
    console.error("Error updating listing:", error);
    req.flash("error", "Failed to update listing");
    return res.redirect("/listings"); // Correct: ADDED 'return' here
  }
};

module.exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing does not exist");
      return res.redirect("/listings");
    }
    await Review.deleteMany({ _id: { $in: listing.reviews } });
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted successfully");
    return res.redirect("/listings"); // Correct: 'return' is already here
  } catch (error) {
    console.error("Error deleting listing:", error);
    req.flash("error", "Failed to delete listing");
    return res.redirect("/listings"); // Correct: ADDED 'return' here
  }
};

module.exports.renderNewForm = (req, res) => {
    try {
        res.render("listings/new");
    } catch (error) {
        console.error("Error rendering new form:", error);
        req.flash("error", "Failed to render new listing form");
        res.redirect("/listings");
    }
};
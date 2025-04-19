const mongoose = require('mongoose');
const User = require('../models/user.model');
const Hotel = require('../models/hotel.model');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function addHotelForUser(email, hotelName) {
  try {
    await mongoose.connect(MONGODB_URI);
    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found for email:', email);
      process.exit(1);
    }
    const existingHotel = await Hotel.findOne({ userId: user._id });
    if (existingHotel) {
      console.log('Hotel already exists for this user:', existingHotel.name);
      process.exit(0);
    }
    const hotel = new Hotel({ name: hotelName, userId: user._id });
    await hotel.save();
    console.log('Hotel added:', hotel);
    process.exit(0);
  } catch (err) {
    console.error('Error adding hotel:', err);
    process.exit(1);
  }
}

// Usage: node addHotel.js user@email.com "Hotel Name"
const [,, email, ...hotelNameParts] = process.argv;
const hotelName = hotelNameParts.join(' ');
if (!email || !hotelName) {
  console.error('Usage: node addHotel.js user@email.com "Hotel Name"');
  process.exit(1);
}
addHotelForUser(email, hotelName);

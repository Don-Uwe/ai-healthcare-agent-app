const mongoose = require("mongoose");
const User = require("../models/UserModel");
const UnverifiedUser = require("../models/UnverifiedUserModel");

const dbConnect = () => {
    mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log("DB CONNECTION IS SUCCESSFUL");
    })
    .catch((error) => {
        console.log('ISSUE IN DB CONNECTION');
        console.error(error.message);
        process.exit(1); 
    });
}
const dbDrop = () => {
    mongoose.connection.dropDatabase()
      .then(() => {
        console.log("DATABASE DROPPED SUCCESSFULLY");
        mongoose.connection.close();
      })
      .catch((error) => {
        console.log('ISSUE IN DROPPING DATABASE');
        console.error(error.message);
      });
  };
  
  const countUsersByEmail = async (email) => {
    try {
        const users = await User.find({ email: email });
        const unverifiedUser = await UnverifiedUser.find({email:email});
        const count = await User.countDocuments({ email: email });
        console.log(`Number of users associated with ${email}: ${count}`);

        
        if (count > 0) {
          console.log(`User IDs: ${users.map(user => user._id).join(', ')}`);
          console.log(`Unverified User IDs: ${unverifiedUser.map(user => user._id).join(', ')}`);
          
      } else {
          console.log(`No users found with the email: ${email}`);
      }
        return count;
    } catch (error) {
        console.error('Error counting users:', error.message);
    }
};
  module.exports = { dbConnect, dbDrop, countUsersByEmail };



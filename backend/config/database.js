const mongoose = require("mongoose");

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
  
  module.exports = { dbConnect, dbDrop };



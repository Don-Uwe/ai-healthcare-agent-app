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

module.exports = dbConnect;

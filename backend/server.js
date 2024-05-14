const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/index');

const app = express();

mongoose.connect(
    'mongodb://localhost:27017'
) // DB URI

app.listen(3025,()=>{
    console.log('Server in Running on port 3025');
});

routes(app);
module.exports = app;
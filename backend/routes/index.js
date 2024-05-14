const usersRoutes = require('../routes/usersRoutes');

module.exports = (app) =>{
    app.use('/getUsers', usersRoutes);
};
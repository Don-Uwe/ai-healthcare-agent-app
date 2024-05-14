const express = require('express');
const app = express.Router();

const UsersController = require('../controllers/usersControllers');
const usersController = new UsersController();

app.post(
    '/',
    usersController.saveUser
)
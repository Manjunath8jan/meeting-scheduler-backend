const express = require('express');
const router = express.Router();
const userController = require('./../controller/userController');
const appConfig = require('./../../config/appconfig');

module.exports.setRouter = (app) => {
    let baseUrl = `${appConfig.apiVersion}/users`;
    console.log('routes called');

    // app.post(`${baseUrl}/check`, (req, res) => res.send(req.body.hello));

     app.post(`${baseUrl}/signup`, userController.signUp);

   // app.post(`${baseUrl}/login`, userController.login);
     app.get(`${baseUrl}/view/all`, userController.getAllUser)
     app.post(`${baseUrl}/:userid/delete`, userController.deleteUser)
     app.post(`${baseUrl}/login`, userController.signIn);
}
const express = require('express');
const app = express();
const fs = require('fs');
const mongoose = require('mongoose');
const bodyParser= require('body-parser');
const morgan = require('morgan');

const appConfig = require('./config/appconfig');
const routeLoggerMiddleware = require('./app/middlewares/routeLogger');
const globalErrorMiddleware = require('./app/middlewares/appErrorHandler');

const modelsPath = './app/model';

const routesPath = './app/routes';

// app.all('*', function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
//     next();
// });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(morgan('dev'));
app.use(routeLoggerMiddleware.logIp)
app.use(globalErrorMiddleware.globalErrorHandler);
//app.use(cookieParser)

fs.readdirSync(modelsPath).forEach(function(file) {
    if(~file.indexOf('.js')) 
        require(modelsPath+'/'+file);
});

fs.readdirSync(routesPath).forEach(function(file){
    if(~file.indexOf('js')){
    let route = require(routesPath+'/'+file);
    route.setRouter(app);
    }
});

app.use(globalErrorMiddleware.globalErrorHandler);

const server = require('http').createServer(app);

server.listen(appConfig.port);
// server.on('error', onError);
// server.on('listening', onListening);


//const socketLib = require();

mongoose.connect(appConfig.db.uri, { useNewUrlParser: true, useUnifiedTopology: true});

module.exports = app;
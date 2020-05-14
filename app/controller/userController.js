const mongoose = require("mongoose");
const shortid = require("shortid");
const passwordLib = require('../libs/passwordLib')
const time = require('../libs/timeLib');
const tokenLib = require('../libs/tokenLib');
const response = require('../libs/responseLib');

const AuthModel = mongoose.model('Auth');
const userModel = mongoose.model('User');

let signUp = (req, res) => {
    console.log('signup called') //debug
  let validateUserInput = () => {
      console.log('validateUserInput called'+''+req.body.email) // debug
    return new Promise((resolve, reject) => {
      if (req.body.email) {
       if (
          req.body.email === null ||
          req.body.email === undefined ||
          req.body.email === ""
        ) {
          let apiResponse = response.generate(true, '"password" parameter is missing"', 400, null);
          res.send(apiResponse)
          reject();
        } else {
          
          resolve(req);
        }
      } else {
        let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
        reject(apiResponse)
      }
    });
  };
  let createUser = () => {
    console.log('create user called') // debug
      return new Promise((resolve, reject)=> {
          userModel.findOne({email: req.body.email})
          .exec((err, retrivedUserDetails)=>{
              console.log("retrivedUserDetails") //debug
              if(err){
                let apiResponse = response.generate(true, 'Failed To Create User', 500, null)
                reject(apiResponse)
              }else if(retrivedUserDetails === null || retrivedUserDetails === undefined || trim(retrivedUserDetails) === '' || retrivedUserDetails.length === 0){
                  console.log(req.body);
                  let newUser = new userModel({
                      userId : shortid.generate(),
                      firstName: req.body.firstName,
                      lastName: req.body.lastName,
                      email: req.body.email,
                      mobileNumber: req.body.mobileNumber,
                      password: passwordLib.hashpassword(req.body.password),
                      createdon: time.now()
                  })
                  newUser.save((err, newUser)=>{
                      if(err){
                        console.log(err)
                        let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                        reject(apiResponse)
                      }else{
                          let newUserObj = newUser.toObject();
                          resolve(newUserObj);
                      }
                  })
              }else{
                let apiResponse = response.generate(true, 'User Already Present With this Email', 403, null)
                reject(apiResponse)
              }
          })
      })
  }

  validateUserInput(req, res)
    .then(createUser)
    .then((resolve) => {
      delete resolve.password
      let apiResponse = response.generate(false, 'User created', 200, resolve)
      res.send(apiResponse)
    })
    .catch((err) => {
        console.log(err);
        res.send(err);
    } ) 

};

let deleteUser = (req, res) => {
  userModel.findOneAndRemove({ 'userId':req.params.userid }).exec((err, result)=>{
    if(err){
      console.log(err);
    }else if(result === null || result === ' ' || result === undefined ){
      console.log('No user found')
    }else{
      console.log("user deleted successfully");
      res.send(result+" deleted successfully");
    }
  })
}

let getAllUser = (req, res) => {
  userModel.find()
    .select('-__v-_id')
    .lean()
    .exec((err, result) => {
      if(err) {
        console.log(err)
      }else if(result === null || result === ' ' || result === undefined){
        console.log("no user Found");
      }else{
        console.log("user details found");
        res.send(result);
      }
    })
}

let signIn = (req, res) => {
  let findUser = () => {
    console.log('find user');
    return new Promise((resolve, reject) => {
      if(req.body.email){
        console.log('req body email is present');
        userModel.findOne({'email':req.body.email}, (err, userDetails) => {
          if(err){
            let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
            reject(apiResponse)
          }else if(userDetails === null || userDetails === ' ' || userDetails === undefined){
            let apiResponse = response.generate(true, 'No User Details Found', 404, null)
            reject(apiResponse)
          }else{
            resolve(userDetails);
          }
        });
      }else{
        reject();
      }
    })
  }
  let validatePassword = (retrivedUserDetails) => {
    console.log("validate Password");
    return new Promise((resolve, reject) => {
      passwordLib.comaparePassword(req.body.password, retrivedUserDetails.password, (err, ismatch) => {
        console.log(retrivedUserDetails.password);
        if(err){
          console.log(err);
          let apiResponse = response.generate(true, 'Login Failed', 500, null)
          reject(apiResponse)
        }else if(ismatch){
          let retrivedUserDetailsObj = retrivedUserDetails.toObject()
          delete retrivedUserDetailsObj.password
          delete retrivedUserDetailsObj._id
          delete retrivedUserDetailsObj.__v
          delete retrivedUserDetailsObj.createdOn
          resolve(retrivedUserDetailsObj)
        }else{
          console.log("user password not found");
          let apiResponse = response.generate(true, 'Wrong Password.Login Failed', 400, null)
          reject(apiResponse)
        }
      })
    })
  }

  let generateToken = (userDetails) => {
    console.log("generate Token");
    return new Promise((resolve, reject)=>{
      tokenLib.generateToken(userDetails, (err, tokenDetails) => {
        if(err){
          console.log(err);
          let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
          reject(apiResponse)
        }else{
          tokenDetails.userId = userDetails.userId;
          tokenDetails.userDetails = tokenDetails.userDetails;
          resolve(tokenDetails);
        }
      })
    })
  }

  let saveToken = (tokenDetails) => {
    console.log("save token")
      return new Promise((resolve, reject)=> {
        AuthModel.findOne({userId: tokenDetails.userId}, (err, retrivedTokenDetails) => {
          if(err){
            console.log(err.message, 'userController: saveToken', 10)
            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
            reject(apiResponse)
          }else if(retrivedTokenDetails === null || retrivedTokenDetails === ' '|| retrivedTokenDetails === undefined){
            let newAuthToken = new AuthModel({
              userId: tokenDetails.userId,
              authToken: tokenDetails.token,
              tokenSecret: tokenDetails.tokenSecret,
              tokenGenerationTime: time.now()
            })
            newAuthToken.save((err, newTokenDetails) => {
              if(err){
                console.log(err)
                let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                reject(apiResponse)
              }else{
                let responseBody ={
                  authToken: newTokenDetails.authToken,
                  userDetails:tokenDetails.userDetails
                }
                resolve(responseBody);
              }
            })
          }else{
            retrivedTokenDetails.authToken = tokenDetails.token
            retrivedTokenDetails.tokenSecret = tokenDetails.tokenSecret
            retrivedTokenDetails.tokenGenerationTime = time.now()
            retrivedTokenDetails.save((err, newTokenDetails) => {
                if (err) {
                    console.log(err)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else {
                    let responseBody = {
                        authToken: newTokenDetails.authToken,
                        userDetails: tokenDetails.userDetails
                    }
                    resolve(responseBody)
                }
            })
          }
        })
      })
    }

  findUser(req, res)
    .then(validatePassword)
    .then(generateToken)
    .then(saveToken)
    .then(resolve => {
      let apiResponse = response.generate(false, 'Login Successful', 200, resolve)
      res.status(200)
      res.send(apiResponse);
    })
    .catch(err => {
      console.log("errorhandler");
      console.log(err);
      res.status(err.status)
      res.send(err)
    });
}

module.exports = {
    signUp: signUp,
    deleteUser: deleteUser,
    getAllUser: getAllUser,
    signIn: signIn 
}

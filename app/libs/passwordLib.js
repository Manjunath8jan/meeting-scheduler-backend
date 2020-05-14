const bcrypt = require('bcrypt');
const saltRounds = 10



let hashpassword = myplaintextPassword => {
    let salt = bcrypt.genSaltSync(saltRounds);
    let hash = bcrypt.hashSync(myplaintextPassword, salt);
    return hash;
}

let comaparePassword = (oldPassword, hashpassword, cb) => {
    bcrypt.compare(oldPassword, hashpassword, (err, res) => {
        if(err){
            console.log("comparison error");
            cb(err, null)
        }else{
            cb(null, res)   
        }
    })
}

module.exports = {
    hashpassword: hashpassword,
    comaparePassword: comaparePassword
}
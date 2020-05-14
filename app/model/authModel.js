const mongoose = require("mongoose");
const schema = mongoose.Schema
const time = require('../libs/timeLib')

const auth = new schema({
    userId: {
        type: String
    },
    tokenSecret: {
        type: String
    },
    tokenGenerationTime: {
        type: Date,
        dafault: time.now()
    }
})

module.exports = mongoose.model('Auth', auth);
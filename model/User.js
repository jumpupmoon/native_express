const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    address: String,
    name: String,
    img: String,
    email: String
})

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
    seq: {type: Number, required: true},
    name: {type: String, required: true},
    distance: Number,
    time: String,
    difficulty: String
})

module.exports = mongoose.model('Point', pointSchema);
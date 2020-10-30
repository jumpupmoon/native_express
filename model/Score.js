const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    course: {type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true},
    start: {type: Date, default: Date.now, required: true},
    end: Date,
    score: {type: Number, required: true},
    address: {type: String, required: true},
    token : Number
})

module.exports = mongoose.model('Score', scoreSchema);
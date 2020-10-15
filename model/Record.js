const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
    start: {type: Date, default: Date.now, required: true},
    score: {type: mongoose.Schema.Types.ObjectId, ref: 'Score', required: true},
    point: {type: mongoose.Schema.Types.ObjectId, ref: 'Point', required: true}
})

module.exports = mongoose.model('Record', recordSchema);
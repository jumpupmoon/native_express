const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    seq: {type: Number, required: true, unique: true},
    name: {type: String, required: true, unique: true},
    distance: Number,
    time: String,
    shelter: [String],
    store: [String],
    toilet: [String],
    discription: String,
    courseDetail: [{type: mongoose.Schema.Types.ObjectId, ref: 'Point'}]
})

module.exports = mongoose.model('Course', courseSchema);
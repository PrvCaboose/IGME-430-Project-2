const mongoose = require('mongoose');
const _ = require('underscore');

const setName = (name) => _.escape(name).trim();

const SongSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true,
        trim: true,
        set: setName,
    },
    artist: {
        type: String,
        required: true,
        trim: true,
        set: setName,
    },
    length: {
        type: Number,
        min: 0,
    },
    createdDate: {
        type: Date,
        default: Date.now(),
    },
});

const SongModel = mongoose.model('Song', SongSchema);
module.exports = SongModel;
const mongoose = require('mongoose');
const _ = require('underscore');

const setName = (name) => _.escape(name).trim();

const PlaylistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        set: setName,
    },
    songs: {
        type: [{
            title: String,
            artist: String,
            length: Number,
        }],
    },  
    owner: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Account',
    },
});

PlaylistSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  songs: doc.songs,
});

const PlaylistModel = mongoose.model('Playlist', PlaylistSchema);
module.exports = PlaylistModel;
const models = require('../models');

const {Playlist} = models;

const initPlaylist = async (req, res) => {
    if (!req.body.name) {
        return res.status(400).json({ error: 'Playlist name is required' });
    }

    const playlistData = {
        name: req.body.name,
        songs: [],
        owner: req.session.Account._id
    }

    try {
        const newPlaylist = new Playlist(playlistData);
        await newPlaylist.save();
        return res.status(201).json({name: newPlaylist.name});
    } catch (err) {
        console.log(err);
        return res.status(500).json({error: "There was an issue creating a playlist"});
    }
}
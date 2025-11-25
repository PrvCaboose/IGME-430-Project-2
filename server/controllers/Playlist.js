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

const addSong = async (req, res) => {
    if (!req.body.title || !req.body.artist) {
        return res.status(400).json({error: "Song title and artists are required!"});
    }

    const songData = {
        title: req.body.title,
        artist: req.body.artist,
        length: req.body.length
    }

    try {
        const query = { owner: req.session.Account._id };
        const docs = await Playlist.find(query).select('name').lean().exec();

        if (!docs) {
            return res.status(400).json({error: "No playlist created!"});
        }
        const thing = await Playlist.findOneAndUpdate({name: "Test"}, {$push: {songs: songData}}).lean().exec();
        return res.status(201).json({song: songData});
    } catch (err) {
        console.log(err);
        res.status(500).json({error: "Couldn't add song"});
    }
}

const getSongs = async (req, res) => {
    try {
        const query = { owner: req.session.Account._id };
        const docs = await Playlist.findOne(query).select('name songs').lean().exec();
        
        if (!docs) {
            return res.status(400).json({error: "No playlist created!"});
        }

        return res.status(200).json({songs: docs.songs});
    } catch (err) {
        console.log(err);
        return res.status(500).json({error: "There was an error getting songs"});
    }
}

const getPlaylist = async (req, res) => {
    try {
        const query = { owner: req.session.Account._id };
        const docs = await Playlist.findOne(query).select('name').lean().exec();
        
        if (!docs) {
            return res.status(400).json({error: "No playlist created!"});
        }
        //return res.status(400).json({error: "No playlist created!"});

        return res.status(200).json({playlist: docs});
    } catch (err) {
        console.log(err);
        return res.status(500).json({error: "There was an error getting songs"});
    }
}

module.exports = {
    initPlaylist,
    addSong,
    getSongs,
    getPlaylist
}
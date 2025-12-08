const models = require('../models');

const { Playlist } = models;

const makerPage = (req, res) => {
  let hasToken = false;
  if (req.session.Account.token) {
    hasToken = true;
  }
  res.render('app', { isPremium: req.session.Account.isPremium, hasToken });
};

const initPlaylist = async (req, res) => {
  if (!req.body.name) {
    return res.status(400).json({ error: 'Playlist name is required' });
  }

  const playlistData = {
    name: req.body.name,
    songs: [],
    owner: req.session.Account._id,
  };

  try {
    const newPlaylist = new Playlist(playlistData);
    await newPlaylist.save();
    return res.status(201).json({ name: newPlaylist.name });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'There was an issue creating a playlist' });
  }
};

const addSong = async (req, res) => {
  if (!req.body.title || !req.body.artist) {
    return res.status(400).json({ error: 'Song title and artists are required!' });
  }

  const songData = {
    title: req.body.title,
    artist: req.body.artist,
    length: req.body.length,
  };

  try {
    const query = { owner: req.session.Account._id };
    const docs = await Playlist.findOne(query).select('name').lean().exec();

    if (!docs) {
      return res.status(400).json({ error: 'No playlist created!' });
    }
    await Playlist.findOneAndUpdate(
      { name: docs.name },
      { $push: { songs: songData } },
    ).lean().exec();
    return res.status(201).json({ song: songData });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Couldn't add song" });
  }
};

const getSongs = async (req, res) => {
  try {
    const query = { owner: req.session.Account._id };
    const docs = await Playlist.findOne(query).select('name songs').lean().exec();

    if (!docs) {
      return res.status(400).json({ error: 'No playlist created!' });
    }

    return res.status(200).json({ songs: docs.songs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'There was an error getting songs' });
  }
};

const getPlaylist = async (req, res) => {
  try {
    const query = { owner: req.session.Account._id };
    const docs = await Playlist.findOne(query).select('name').lean().exec();

    if (!docs) {
      return res.status(400).json({ error: 'No playlist created!' });
    }

    return res.status(200).json({ playlist: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'There was an error getting songs' });
  }
};

const removeSong = async (req, res) => {
  if (!req.body._id) {
    return res.status(400).json({ error: 'No ID given!' });
  }
  try {
    console.log(req.body._id);
    const docs = await Playlist.updateOne({ owner: req.session.Account._id }, {
      $pull: {
        songs: { _id: req.body._id },
      },
    }).lean().exec();
    console.log(docs);
    return res.status(200).json({ message: 'Song Removed' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'There was an error removing the song' });
  }
};

module.exports = {
  initPlaylist,
  addSong,
  getSongs,
  getPlaylist,
  removeSong,
  makerPage,
};

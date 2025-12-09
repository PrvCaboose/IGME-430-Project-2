const models = require('../models');

const { Playlist } = models;

// render the maker page
const makerPage = (req, res) => {
  // uses handlebars to dynamically render the premium and spotify elements
  let hasToken = false;
  if (req.session.Account.token) {
    hasToken = true;
  }
  res.render('app', { isPremium: req.session.Account.isPremium, hasToken });
};

// create a playlist
const initPlaylist = async (req, res) => {
  if (!req.body.name) {
    return res.status(400).json({ error: 'Playlist name is required' });
  }

  const playlistData = {
    name: req.body.name,
    songs: [],
    owner: req.session.Account._id,
  };
  // try and create a playlist given the data in the db
  try {
    const newPlaylist = new Playlist(playlistData);
    await newPlaylist.save();
    return res.status(201).json({ name: newPlaylist.name });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'There was an issue creating a playlist' });
  }
};

// adds a song given a name and artist, length optional
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
    // get playlist from session owner
    const query = { owner: req.session.Account._id };
    const docs = await Playlist.findOne(query).select('_id').lean().exec();

    if (!docs) {
      return res.status(400).json({ error: 'No playlist created!' });
    }
    // try and update songs array
    const songDocs = await Playlist.findOneAndUpdate(
      { _id: docs._id },
      { $push: { songs: songData } },
    ).lean().exec();
    return res.status(201).json({ song: songDocs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Couldn't add song" });
  }
};
// get a list of songs from the user
const getSongs = async (req, res) => {
  try {
    // get user's playlist
    const query = { owner: req.session.Account._id };
    const docs = await Playlist.findOne(query).select('name songs').lean().exec();

    if (!docs) {
      return res.status(400).json({ error: 'No playlist created!' });
    }
    // return songs array from playlist
    return res.status(200).json({ songs: docs.songs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'There was an error getting songs' });
  }
};
// get user's playlist
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

// removes a song from the playlist given the song id
const removeSong = async (req, res) => {
  if (!req.body._id) {
    return res.status(400).json({ error: 'No ID given!' });
  }
  try {
    await Playlist.updateOne({ owner: req.session.Account._id }, {
      $pull: {
        songs: { _id: req.body._id },
      },
    }).lean().exec();
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

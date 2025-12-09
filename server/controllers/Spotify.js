const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = 'http://127.0.0.1:3000/callback';
const crypto = require('crypto');
const querystring = require('querystring');

const login = (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  const scope = 'user-read-private user-read-email';

  return res.json({
    redirect: `https://accounts.spotify.com/authorize?${
      querystring.stringify({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope,
        redirect_uri: REDIRECT_URI,
        state,
      })}`,
  });
};

// callback function used to get api token upon login
const callback = async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;

  if (state === null) {
    return res.redirect(`/#${
      querystring.stringify({
        error: 'state_mismatch',
      })}`);
  }

  let authCode = Buffer.from(`${CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`);
  authCode = authCode.toString('base64');
  let response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${authCode}`,
    },
    body: new URLSearchParams({
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
    json: true,
  });
  response = await response.json();

  // store api token in user session
  req.session.Account.token = response.access_token;
  // redirect user back to page
  return res.redirect('/maker');
};

// search spotify for songs given a title and artist
const searchSongs = async (req, res) => {
  // set up query
  let query = '';
  if (req.query.title) {
    query += `track:${req.query.title}`;
  }
  query = querystring.stringify({
    q: `track:${req.query.track} artist:${req.query.artist}`,
    type: 'track',
  });

  let response = await fetch(`https://api.spotify.com/v1/search?${query}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${req.session.Account.token}`,
    },
  });

  response = await response.json();
  // send songs back to user
  res.status(200).json({ songs: response });
};

module.exports = {
  login,
  callback,
  searchSongs,
};

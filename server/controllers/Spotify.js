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

const callback = async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;

  console.log('callback');

  if (state === null) {
    return res.redirect(`/#${
      querystring.stringify({
        error: 'state_mismatch',
      })}`);
  }
  // const authOptions = {
  //   url: 'https://accounts.spotify.com/api/token',
  //   form: {
  //     code,
  //     redirect_uri: REDIRECT_URI,
  //     grant_type: 'authorization_code',
  //   },
  //   headers: {
  //     'content-type': 'application/x-www-form-urlencoded',
  //     Authorization: `Basic ${(`${CLIENT_ID}:
  // ${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
  //   },
  //   json: true,
  // };

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:
        ${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
    json: true,
  });
  console.log(await response.json());
  // PROCESS api token

  return res.redirect('/maker');
};

module.exports = {
  login,
  callback,
};

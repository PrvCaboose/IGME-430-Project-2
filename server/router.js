const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  // account routes
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/buyPremium', mid.requiresLogin, controllers.Account.buyPremium);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.post('/passChange', mid.requiresSecure, mid.requiresLogout, controllers.Account.changePassword);

  // spotify routes
  app.get('/spotifyLogin', mid.requiresSecure, mid.requiresLogin, controllers.Spotify.login);
  app.get('/callback', mid.requiresSecure, mid.requiresLogin, controllers.Spotify.callback);
  app.get('/searchSongs', mid.requiresLogin, controllers.Spotify.searchSongs);

  // song routes
  app.post('/createPlaylist', mid.requiresLogin, controllers.Playlist.initPlaylist);
  app.post('/addSong', mid.requiresLogin, controllers.Playlist.addSong);
  app.get('/getSongs', mid.requiresLogin, controllers.Playlist.getSongs);
  app.get('/getPlaylist', mid.requiresLogin, controllers.Playlist.getPlaylist);
  app.post('/removeSong', mid.requiresLogin, controllers.Playlist.removeSong);

  // page routes
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/maker', mid.requiresLogin, controllers.Playlist.makerPage);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  // route all other requests to login page
  app.get('/*splat', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;

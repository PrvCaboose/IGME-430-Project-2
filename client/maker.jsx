const helper = require('./helper.js');
const React = require('react');
const {useState, useEffect} = React;
const {createRoot} = require('react-dom/client');

const handleSong = (e, onSongAdded) => {
  e.preventDefault();
  helper.hideError();
  
  const title = e.target.querySelector('#songTitle').value;
  const artist = e.target.querySelector('#songArtist').value;
  const min = parseInt(e.target.querySelector('#songLengthMin').value) || 0;
  const sec = parseInt(e.target.querySelector('#songLengthSec').value) || 0;

  const length = (min * 60) + sec;

  if (!title || !artist) {
    helper.handleError('All fields are required!');
    return false;
  }

  helper.sendPost(e.target.action, {title, artist, length}, onSongAdded);
  return false;
}

const handlePlaylist = (e) => {
  e.preventDefault();
  helper.hideError();
  
  const name = e.target.querySelector('#playlistName').value;

  if (!name) {
    helper.handleError('Name is required!');
    return false;
  }

  helper.sendPost(e.target.action, {name}, null);
  e.hidden = true;
  return false;
}

const SongForm = (props) => {
  return(
    <form id='songForm'
      onSubmit={(e) => handleSong(e, props.triggerReload)}
      name='songForm'
      action="/addSong"
      method="POST"
      className='songForm'>
        <label htmlFor="title">Song Title: </label>
        <input id='songTitle' type='text' name='title' placeholder='Song Title'/>
        <label htmlFor="artist">Artist: </label>
        <input id="songArtist" type="text" name='artist'/>
        <label htmlFor="length">Length: </label>
        <input id="songLengthMin" type="number" min="0" name='length' placeholder='minutes'/>
        <input id="songLengthSec" type="number" min="0" max="60" name='length' placeholder='seconds'/>
        <input className='makeSongSubmit' type="submit" value="Add Song" />
      </form>
  );
}

const PlaylistForm = (props) => {
  if (props.hidden) {
    return (<></>);
  } else {
    return(
      <form id='playlistForm'
        onSubmit={(e) => handlePlaylist(e)}
        name='playlistForm'
        action="/createPlaylist"
        method="POST"
        className='playlistForm'
        hidden="">
          <label htmlFor="name">Playlist Name: </label>
          <input id='playlistName' type='text' name='name' placeholder='Playlist Name'/>
          <input className='makePlaylistSubmit' type="submit" value="Create Playlist" />
      </form>
    );
  }
}

const SongList = (props) => {
  const [songs, setSongs] = useState(props.songs);

  useEffect(() => {
    const loadPlaylistFromServer = async () => {
      const response = await fetch('/getSongs');
      const data = await response.json();
      console.log(data.songs);
      setSongs(data.songs);
    }
    loadPlaylistFromServer();
  }, [props.reloadSongs]);

  if(songs.length === 0) {
    return (
      <div className='playist'>
        <h3 className='emptySong'>No Songs Yet!</h3>
      </div>
    );
  }

  const songNodes = songs.map(song => {
    return (
      <div key={song.id} className='song'>
        <h3 className='songTitle'>Title: {song.title}</h3>
        <h3 className='songArtist'>Artist: {song.artist}</h3>
      </div>
    );
  });

  return (
    <div className='songList'>
      {songNodes}
    </div>
  );
}

const handleLogin = async (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;

    if (!username || !pass) {
        helper.handleError('Username or Password is empty!');
        return false;
    }

    //helper.sendPost(e.target.action, {username, pass});

  const response = await fetch(e.target.action, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

    return false;
}

const getPlaylist = async () => {
  let response = await fetch('/getPlaylist');
  response = await response.json();
  console.log(response.error);
  if (response.error) {
    return false;
  }
  return true;
}

const removeSong = async () => {
  helper.sendPost('/removeSong', {_id: "6924b547112943a07c0b68be"});
}

const App = (props) => {
  const [reloadSongs, setReloadSongs] = useState(false);

  return (
    <div>
      <div>
        <PlaylistForm hidden={props.hidden}/>
      </div>
      <div id='addSong'>
        <SongForm triggerReload={() => setReloadSongs(!reloadSongs)} />
      </div>
      <div id='songs'>
        <SongList songs={[]} reloadSongs={reloadSongs}/>
      </div>
    </div>
  );

  return (
    <form id='loginForm'
      name='loginForm'
      onSubmit={handleLogin}
      action="/spotifyLogin"
      method='POST'
      className="mainForm">
          <label htmlFor='username'>Spotify Username: </label>
          <input id='user' type='text' name='username' placeholder='username' />
          <label htmlFor="pass">Spotify Password</label>
          <input id='pass' type='text' name='pass' placeholder='password'/>
          <input className='formSubmit' type='submit' value="Sign in"/>
    </form>
  );
}

const init = () => {
  const root = createRoot(document.getElementById('app'));
  removeSong();
  getPlaylist().then((e) => {
    root.render(<App hidden={e}/>);
  });
  
}

window.onload = init;
const helper = require('./helper.js');
const React = require('react');
const {useState, useEffect} = React;
const {createRoot} = require('react-dom/client');

const handleSong = (e, onDomoAdded) => {
  e.preventDefault();
  helper.hideError();
  
  const name = e.target.querySelector('#domoName').value;
  const age = e.target.querySelector('#domoAge').value;

  if (!name || !age) {
    helper.handleError('All fields are required!');
    return false;
  }

  helper.sendPost(e.target.action, {name,age}, onDomoAdded);
  return false;
}

const SongForm = (props) => {
  return(
    <form id='songForm'
      onSubmit={(e) => handleSong(e, props.triggerReload)}
      name='songForm'
      action="/maker"
      method="POST"
      className='songForm'>
        <label htmlFor="name">Song Name: </label>
        <input id='songName' type='text' name='name' placeholder='Song Name'/>
        <label htmlFor="artist">Artist: </label>
        <input id="songArtist" type="number" min="0" name='artist'/>
        <input className='makeDomoSubmit' type="submit" value="Add Song" />
      </form>
  );
}

const SongList = (props) => {
  const [songs, setSongs] = useState(props.songs);

  useEffect(() => {
    const loadPlaylistFromServer = async () => {
      const response = await fetch('/getSongs');
      const data = await response.json();
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

  const domoNodes = domos.map(domo => {
    return (
      <div key={domo.id} className='domo'>
        <img src="/assets/img/domoface.jpeg" alt="domo face" className='domoFace' />
        <h3 className='domoName'>Name: {domo.name}</h3>
        <h3 className='domoAge'>Age: {domo.age}</h3>
      </div>
    );
  });

  return (
    <div className='domoList'>
      {domoNodes}
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

const App = () => {
  const [reloadSongs, setReloadSongs] = useState(false);

  return (
    <div>
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
  root.render(<App/>);
}

window.onload = init;
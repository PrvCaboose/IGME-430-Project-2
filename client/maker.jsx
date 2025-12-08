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

  // clear input
  e.target.querySelector('#songTitle').value = '';
  e.target.querySelector('#songArtist').value = '';
  e.target.querySelector('#songLengthMin').value = '';
  e.target.querySelector('#songLengthSec').value = '';
  showForm();

  helper.sendPost(e.target.action, {title, artist, length}, onSongAdded);
  return false;
}

const removeSong = async (e, triggerReload) => {
  e.preventDefault();
  helper.hideError();

  helper.sendPost('/removeSong', {_id: e.target.parentElement.id}, triggerReload);
  return false;
}

const handlePlaylist = (e, onPlaylistCreated) => {
  e.preventDefault();
  helper.hideError();
  
  const name = e.target.querySelector('#playlistName').value;

  if (!name) {
    helper.handleError('Name is required!');
    return false;
  }
  helper.sendPost(e.target.action, {name}, onPlaylistCreated);
  e.target.hidden = true;
  return false;
}

const showForm = () => {
  const overlay = document.getElementById('popupOverlay');
  overlay.classList.toggle('show');
}

const SongForm = (props) => {
  return(
    <div id='popupOverlay' className='overlay-container'>
      <div className='popup-box'>
        <form id='songForm'
        onSubmit={(e) => handleSong(e, props.triggerReload)}
        name='songForm'
        action="/addSong"
        method="POST"
        className='songForm'>
          <div className='songFormTitle'>
            <label htmlFor="title">Song Title: </label>
            <input id='songTitle' type='text' name='title' placeholder='Song Title'/>
          </div>
          <div className='songFormArtist'>
            <label htmlFor="artist">Artist: </label>
            <input id="songArtist" type="text" name='artist' placeholder='Song Artist'/>
          </div>
          <div className='songFormLength'>
            <label htmlFor="length">Length: </label>
            <input id="songLengthMin" type="number" min="0" name='length' placeholder='minutes'/>
            <input id="songLengthSec" type="number" min="0" max="60" name='length' placeholder='seconds'/>
          </div>
          <div className='songFormButtons'>
            <input className='makeSongSubmit' type="submit" value="Add Song" />
            <input className='addSongCancel' type='button' value="Cancel" onClick={showForm}/>
          </div>
        </form>
      </div>
    </div>
    
  );
}

const PlaylistForm = (props) => {
  if (props.hidden) {
    return (<></>);
  } else {
    return(
      <div className='playlistFormContainer'>
        <form id='playlistForm'
          onSubmit={(e) => handlePlaylist(e, init)}
          name='playlistForm'
          action="/createPlaylist"
          method="POST"
          className='playlistForm'
          hidden="">
            <label htmlFor="name">Playlist Name: </label>
            <input id='playlistName' type='text' name='name' placeholder='Playlist Name'/>
            <input className='makePlaylistSubmit' type="submit" value="Create Playlist" />
        </form>
      </div>
    );
  }
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

  if (!props.playlist) {
    return(
      <div></div>
    );
  }

  const songNodes = songs.map(song => {
    const param = new URLSearchParams({'search_query' : song.title + ' ' + song.artist});
    let songSec = song.length % 60;
    let songMin = Math.floor(song.length/60);

    if (songSec === 0) {
      songSec = '00';
    } else if (songSec < 10) {
      songSec = `0${songSec}`;
    }
    return (
      <div key={song._id} id={song._id} className='song'>
        <div className='songInfo'>
          <h3 className='songTitle'>{song.title}</h3>
          <h3 className='songArtist'>{song.artist}</h3>
        </div>
        <p className='songLength'>{songMin}:{songSec}</p>
        <a className='songLink' href={'https://www.youtube.com/results?'+param.toString()} target='_blank'>Search on Youtube</a>
        <button className='songButton' type='button' onClick={(e) => removeSong(e, props.triggerReload)}>Remove Song</button>
      </div>
    );
  });

  let playlistSec = 0;

  songs.forEach(song => {
    playlistSec += song.length;
  });

  const playlistHour = Math.floor(playlistSec / 3600);
  playlistSec = playlistSec % 3600;
  const playlistMin = Math.floor(playlistSec/60);

  return (
      <div className='songList' hidden="True">
        <div className='playlistHeader'>
          <div className='playlistInfo'>
            <h1 id='playlistName'>{props.playlist.playlist.name}</h1>
            <h1 id='playlistTime'>{playlistHour}h {playlistMin}min</h1>
          </div>
          <button className='addSongButton' type='button' onClick={showForm}>Add Song</button>
        </div>
        {songNodes}
      </div>
  );
}

const handleLogin = async (e) => {
  e.preventDefault();
  helper.hideError();

  let response = await fetch(e.target.action, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  response = await response.json();
  window.location = response.redirect;
  return false;
}

const getPlaylist = async () => {
  let response = await fetch('/getPlaylist');
  response = await response.json();

  if (response.error) {
    return false;
  }
  return response;
}

const handleSpotifySearch = async (e) => {
  e.preventDefault();

  const title = document.getElementById('songNameBox').value;
  const artist = document.getElementById('songArtistBox').value;

  const params = new URLSearchParams();
  params.append('track', title);
  params.append('artist', artist);

  let response = await fetch('/searchSongs?'+params.toString(), {
    method: 'GET',
    headers: {
      accept: 'application/json'
    }
  });

  response = await response.json();
  console.log(response);
  const searchBox = document.getElementById('searchResults');
  response.songs.tracks.items.forEach(item => {

    let div = document.createElement('div');
    div.className = 'trackResult';

    let header1 = document.createElement('h3');;
    header1.className = 'trackName';
    header1.innerHTML = item.name;
    div.appendChild(header1);

    let header3 = document.createElement('h3');;
    header3.className = 'trackArtist';
    header3.innerHTML = item.artists[0].name;
    div.appendChild(header3);

    let header2 = document.createElement('h3');;
    header2.className = 'trackLength';
    let sec = '0';
    if (Math.floor((item.duration_ms/1000)%60) > 10) {
      sec = Math.floor((item.duration_ms/1000)%60);
    } else {
      sec += Math.floor((item.duration_ms/1000)%60);
    }
    header2.innerHTML = `${Math.floor(item.duration_ms/60000)}:${sec}`;

    div.appendChild(header2);
    searchBox.appendChild(div);
    }
  );
}

const SpotifyLink = () => {

}

const getPremium = () => {
  helper.sendPost('/buyPremium', {}, null);
}


const App = (props) => {
  const [reloadSongs, setReloadSongs] = useState(false);
  return (
    <div>
      <div>
        <PlaylistForm hidden={props.hidden} triggerReload={() => setReloadSongs(!reloadSongs)}/>
      </div>
      <div id='addSong'>
        <SongForm triggerReload={() => setReloadSongs(!reloadSongs)} />
      </div>
      <div id='songs'>
        <SongList playlist={props.playlist} songs={[]} reloadSongs={reloadSongs} triggerReload={() => setReloadSongs(!reloadSongs)}/>
      </div>
    </div>
  );
}

const init = () => {
  const getPremiumBtn = document.getElementById('getPremiumLink');
  if (getPremiumBtn) {
    getPremiumBtn.onclick = getPremium;
  }

  let spotifyForm = document.getElementById('loginForm');
  if (spotifyForm) {
    spotifyForm.onsubmit = handleLogin;
  } else {
    spotifyForm = document.getElementById('spotifySearch');
    spotifyForm.onsubmit = handleSpotifySearch;
  }

  const root = createRoot(document.getElementById('app'));
  getPlaylist().then((e) => {
    root.render(<App hidden={e} playlist={e}/>);
  });
  
}

window.onload = init;
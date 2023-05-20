var audioPlayer;
var playPauseButton;
var seekBar;
var currentTimeDisplay;
var durationDisplay;
var musicTitle;
var musicTitleMsg;

var currentIndex;
var myPlaylist;
var shuffle = false;

window.onload = function () {
    document.getElementById('loginBtn').onclick = login;
    if (sessionStorage.getItem('my-token') != "") {
        showAfterLogin();
        initPlayerView();
    }

}


function getRepeatStep() {

    const repeatStepSelect = document.getElementById('repeatStep');
    const selectedValue = repeatStepSelect.value;
    return selectedValue;
}

function logout() {
    sessionStorage.setItem('my-token', "");
    sessionStorage.setItem('username', "");

}

function playNow() {
    if(myPlaylist.length > currentIndex) {
        song = myPlaylist[currentIndex];
        play(song.urlPath,song.title,currentIndex);
    }
    else {
        var step = getRepeatStep();
        if(step == 2) {
            currentIndex = 0;
            playNow();
        }

    }
}

function isShuffle() {
    return shuffle;

}

function initPlayerView() {

    audioPlayer = document.getElementById('audioPlayer');
    playPauseButton = document.getElementById('playPauseButton');
    seekBar = document.getElementById('seekBar');

    currentTimeDisplay = document.getElementById('currentTime');
    durationDisplay = document.getElementById('duration');
    musicTitle = document.getElementById('musicTitle');

    nextButton = document.getElementById("nextButton");
    preButton = document.getElementById("preButton");

    var shuffleButton = document.getElementById("shuffleButton");


    shuffleButton.addEventListener('click', function () {
        
        if(shuffle) {
            shuffleButton.innerHTML = '<img src="images/shuffle_off.png">';
        }
        else {
            shuffleButton.innerHTML = '<img src="images/shuffle_on.png">';
        }

        shuffle = !shuffle;
    });

    playPauseButton.addEventListener('click', function () {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPauseButton.innerHTML = '<img src="images/pause.png">';
        } else {
            audioPlayer.pause();
            playPauseButton.innerHTML = '<img src="images/play.png">';
        }
    });

    nextButton.addEventListener('click',function() {
        next();
        playNow();
    });

    preButton.addEventListener('click',function() {
        prev();
        if(currentIndex < 0) {
            currentIndex = 0;
        }
        playNow();
    });



    audioPlayer.addEventListener('timeupdate', function () {
        const currentTime = formatTime(audioPlayer.currentTime);
        currentTimeDisplay.textContent = currentTime;

        musicTitle.textContent = musicTitleMsg;

        const totalDuration = formatTime(audioPlayer.duration);
        durationDisplay.textContent = totalDuration;

        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        seekBar.value = progress;

        if(audioPlayer.currentTime == audioPlayer.duration) {
            var step = getRepeatStep();
            if(step != 3) {
                currentIndex = currentIndex + 1;
            }
            playNow();
        }

    });


    seekBar.addEventListener('input', function () {
        const seekTime = (audioPlayer.duration / 100) * seekBar.value;
        audioPlayer.currentTime = seekTime;
    });
}

function next() {
    if(isShuffle()) {
        currentIndex = Math.floor(Math.random() * myPlaylist.length);
    }
    else {
        currentIndex = currentIndex + 1;
    }
    
    
}

function prev() {
    if(isShuffle()) {
        currentIndex = Math.floor(Math.random() * myPlaylist.length);
    }
    else {
        currentIndex = currentIndex - 1;
    }
    if(currentIndex < 0 ) {
        currentIndex = 0;
    }
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${padZero(minutes)}:${padZero(seconds)}`;
}

function padZero(num) {
    return num.toString().padStart(2, '0');
}

async function login() {
    const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            "username": document.getElementById('username').value,
            "password": document.getElementById('password').value
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const result = await response.json();
    if (result.status) {
        document.getElementById('err').innerText = result.message;
    } else {
        //save token to session storage
        //hide login form
        //display logout button
        //pull song you may interested
        //pull playlist of the current user
        
        sessionStorage.setItem('my-token', result.accessToken);
        sessionStorage.setItem('username', result.username);
        showAfterLogin();

    }
}

function showAfterLogin() {


    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('welcome').innerText = `Welcome, ${sessionStorage.getItem('username')}`;
    fetchSongs();
    loadMyPlaylist("");
}




async function removeSong(songID) {
    let resp = await fetch(baseURL + "/playlist/remove", {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('my-token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "songId": songID,
        }),
    });

    let songs = await resp.json();

    loadMyPlaylist(songID);
}

async function addevent(songID) {

    let resp = await fetch(baseURL + "/playlist/add", {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('my-token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "songId": songID,
        }),
    });

    let songs = await resp.json();

    loadMyPlaylist("");

}

var baseURL = "http://localhost:3000/api";
var mp3BaseUrl = "http://localhost:3000/";

async function fetchSongs() {
    const response = await fetch(baseURL + '/music', {
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('my-token')}`
        }
    });

    if(response.status != 200) {

    }
    let songs = await response.json();

    let html = `
            <tr>
                <th>title</th>
                <th>releaseDate</th>
                <th>Action</th>
            </tr>
        `;
    songs.forEach(song => {
        html += `
        <tr>
            <td>${song.title}</td>
            <td>${song.releaseDate}</td>
            <td><a href='#' onclick="addevent('${song.id}')">+</a></td>
        </tr>
        `;
        document.getElementById('songs').innerHTML = html;
    })
}


async function playClick(event,url,title,pIndex) {
    event.preventDefault();
    play(url,title,pIndex);
}

async function play(url,title,pIndex) {
    let mp3 = mp3BaseUrl + url;
    console.log(mp3);

    var audio = document.getElementById("audioPlayer");
    audio.src = mp3;
    audio.play();
    playPauseButton.innerHTML = '<img src="images/pause.png">';
    musicTitleMsg = title;
    currentIndex = pIndex;
    return false;
}

async function loadMyPlaylist(songID) {

    const response = await fetch(baseURL + '/playlist', {
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('my-token')}`
        }
    });

    let songs = await response.json();

    if (songID != "") {
        songs = songs.filter((song) => song.id != songID);
    }

    myPlaylist = songs;

    let html = `
            <tr>
                <th>title</th>
                <th>Action</th>
            </tr>
        `;

    var pIndex = 0;
    
    if(songs.length == 0) {
        return;
    }

    songs.forEach(song => {
        html += `
        <tr>
            <td>${song.title}</td>
            <td><a href='#' onclick="removeSong('${song.id}')">-</a> ,
            <a href="" onclick="return playClick(event,'${song.urlPath}','${song.title}',${pIndex})">Play</a>
            </td>
        </tr>
        `;
        pIndex = pIndex + 1;
    })
    document.getElementById('myPlaylist').innerHTML = html;
}
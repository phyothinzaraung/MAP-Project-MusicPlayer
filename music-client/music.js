window.onload = function () {
    document.getElementById('loginBtn').onclick = login;
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
        console.log(result);
        sessionStorage.setItem('my-token', result.accessToken);
        sessionStorage.setItem('username', result.username);
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        document.getElementById('welcome').innerText = `Welcome, ${result.username}`;
        fetchSongs();

    }
}

async function fetchSongs() {
    const response = await fetch('http://localhost:3000/api/music', {
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('my-token')}`
        }
    });
    const songs = await response.json();
    console.log(songs);
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
            <td>+</td>
        </tr>
        `;
        document.getElementById('songs').innerHTML = html;
    })
}
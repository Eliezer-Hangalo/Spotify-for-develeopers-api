async function getAccessToken() {
    const res = await fetch('/api/get-token');
    const data = await res.json();
    return data.access_token;
}

async function search(query, type = 'track') {
    const token = await getAccessToken();
    const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=12`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    const items = data.tracks?.items || data.playlists?.items || data.shows?.items || [];
    render(items, type);
}

function render(items, type) {
    const grid = document.getElementById('listaResultados');
    grid.innerHTML = '';

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'music-card';
        const img = item.images?.[0]?.url || item.album?.images?.[0]?.url;

        div.innerHTML = `
            <img src="${img}">
            <h4 style="margin:10px 0 2px 0; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</h4>
            <p style="color:var(--text-dim); font-size:12px;">${item.artists?.[0]?.name || 'Spotify Content'}</p>
        `;

        div.onclick = () => {
            const player = document.getElementById('player-container');
            player.innerHTML = `<iframe src="https://open.spotify.com/embed/${type}/${item.id}?theme=0" 
            width="100%" height="80" frameBorder="0" allow="autoplay; encrypted-media;" style="border-radius:15px;"></iframe>`;
        };
        grid.appendChild(div);
    });
}

// Ativar Botões da Sidebar e Géneros
document.querySelectorAll('.nav-item, .playlist-item').forEach(item => {
    item.onclick = () => {
        document.querySelectorAll('.nav-item, .playlist-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        search(item.dataset.query, item.dataset.type);
    };
});

document.querySelectorAll('.genre-pill').forEach(pill => {
    pill.onclick = () => {
        document.querySelectorAll('.genre-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        search(pill.innerText, 'track');
    };
});

document.getElementById('termoPesquisa').onkeypress = (e) => {
    if (e.key === 'Enter') search(e.target.value);
};

// Start
search('Top Hits');
// 1. Obter Token via API segura (Vercel)
async function getAccessToken() {
    const response = await fetch('/api/get-token');
    const data = await response.json();
    return data.access_token;
}

// 2. Pesquisar músicas
async function searchTracks(query) {
    const token = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=12`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await response.json();
    renderTracks(data.tracks.items);
}

// 3. Renderizar na grelha
function renderTracks(tracks) {
    const grid = document.getElementById('listaResultados');
    grid.innerHTML = '';
    
    tracks.forEach(track => {
        const div = document.createElement('div');
        div.className = 'music-card';
        div.innerHTML = `
            <img src="${track.album.images[0].url}">
            <h4>${track.name}</h4>
            <p>${track.artists[0].name}</p>
        `;
        div.onclick = () => playTrack(track.id);
        grid.appendChild(div);
    });
}

// 4. Mudar o Player Embed
function playTrack(trackId) {
    const container = document.getElementById('player-container');
    container.innerHTML = `
        <iframe src="https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0" 
        width="100%" height="80" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
}

// Eventos
document.getElementById('termoPesquisa').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchTracks(e.target.value);
});

// Pesquisa inicial
searchTracks('Trending');
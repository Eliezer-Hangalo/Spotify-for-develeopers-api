
       async function search(query, type = 'track') {
    const resToken = await fetch('/api/get-token');
    const { access_token } = await resToken.json();
    const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=12`, {
        headers: { Authorization: 'Bearer ' + access_token }
    });
    const data = await res.json();
    const items = data.tracks?.items || data.shows?.items || data.playlists?.items || [];
    const grid = document.getElementById('listaResultados');
    grid.innerHTML = items.map(item => `
        <div class="music-card" onclick="play('${item.id}', '${type}')">
            <img src="${item.images?.[0]?.url || item.album?.images?.[0]?.url}">
            <h4>${item.name}</h4>
        </div>
    `).join('');
}
function play(id, type) {
    document.getElementById('player-container').innerHTML = 
    `<iframe src="https://open.spotify.com/embed/${type}/${id}?theme=0" width="100%" height="80" frameBorder="0" allow="autoplay; encrypted-media;"></iframe>`;
}
document.querySelectorAll('.nav-item').forEach(btn => btn.onclick = () => search(btn.dataset.query, btn.dataset.type));
search('Top Hits');

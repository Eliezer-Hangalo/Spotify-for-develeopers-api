// Memória Local
let history = JSON.parse(localStorage.getItem('h')) || [];
let stats = JSON.parse(localStorage.getItem('s')) || {};

async function search(q, type = 'track', items = null) {
    const grid = document.getElementById('grid');
    if (!items) {
        const resT = await fetch('/api/get-token');
        const token = await resT.json();
        const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=${type}&limit=12`, {
            headers: { Authorization: 'Bearer ' + token.access_token }
        });
        const data = await res.json();
        items = data.tracks?.items || data.playlists?.items || [];
    }

    grid.innerHTML = items.map(i => `
        <div class="card" onclick="play('${i.id}', '${i.type || type}', ${JSON.stringify(i).replace(/"/g, '"')})">
            <img src="${i.images?.[0]?.url || i.album?.images?.[0]?.url || ''}">
            <h4>${i.name}</h4>
        </div>
    `).join('');
}

function play(id, type, data) {
    // Salvar no histórico e estatísticas
    if(!history.find(x => x.id === id)) history.unshift(data);
    stats[id] = (stats[id] || 0) + 1;
    localStorage.setItem('h', JSON.stringify(history.slice(0,20)));
    localStorage.setItem('s', JSON.stringify(stats));

    const eType = type === 'show' ? 'episode' : type;
    // LINK OFICIAL DE EMBED
    document.getElementById('player').innerHTML = `
        <iframe src="https://open.spotify.com/embed/${eType}/${id}" 
        width="100%" height="80" frameBorder="0" allow="encrypted-media"></iframe>`;
}

// Botões Library
document.getElementById('btn-hist').onclick = () => search('', '', history);
document.getElementById('btn-mais').onclick = () => {
    const sorted = history.sort((a,b) => (stats[b.id] || 0) - (stats[a.id] || 0));
    search('', '', sorted);
};

document.getElementById('busca').onkeypress = (e) => { if(e.key === 'Enter') search(e.target.value); };

search('Top Hits');
 

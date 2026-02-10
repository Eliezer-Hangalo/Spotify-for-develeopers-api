document.addEventListener('DOMContentLoaded', () => {
    carregarPlaylists();
    search('Top Portugal');
});

// --- SISTEMA DE MEMÓRIA AVANÇADA ---
function updateIntelligence(item, type) {
    let history = JSON.parse(localStorage.getItem('ma_history')) || [];
    let stats = JSON.parse(localStorage.getItem('ma_stats')) || {};

    // Máquina do Tempo
    history = history.filter(i => i.id !== item.id);
    history.unshift({ ...item, type });
    if (history.length > 25) history.pop();
    localStorage.setItem('ma_history', JSON.stringify(history));

    // Mais Ouvidas
    stats[item.id] = { count: (stats[item.id]?.count || 0) + 1, data: item, type: type };
    localStorage.setItem('ma_stats', JSON.stringify(stats));
}

// --- FAVORITOS (LIKES) ---
function toggleLike(e, id, data) {
    e.stopPropagation();
    let favs = JSON.parse(localStorage.getItem('ma_favs')) || [];
    const index = favs.findIndex(f => f.id === id);
    
    if (index > -1) {
        favs.splice(index, 1);
        e.target.classList.replace('fa-solid', 'fa-regular');
        e.target.style.color = 'white';
    } else {
        favs.push(data);
        e.target.classList.replace('fa-regular', 'fa-solid');
        e.target.style.color = '#1db954';
    }
    localStorage.setItem('ma_favs', JSON.stringify(favs));
}

async function search(query, type = 'track', forceItems = null) {
    const grid = document.getElementById('listaResultados');
    let items = forceItems;

    if (!items) {
        const resT = await fetch('/api/get-token');
        const { access_token } = await resT.json();
        const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=20`, {
            headers: { Authorization: 'Bearer ' + access_token }
        });
        const data = await res.json();
        items = data.tracks?.items || data.playlists?.items || data.shows?.items || [];
    }

    const favs = JSON.parse(localStorage.getItem('ma_favs')) || [];

    grid.innerHTML = items.map(item => {
        const isLiked = favs.some(f => f.id === item.id);
        const img = item.images?.[0]?.url || item.album?.images?.[0]?.url || 'https://via.placeholder.com/300';
        
        return `
            <div class="music-card" onclick="play('${item.id}', '${item.type || type}', ${JSON.stringify(item).replace(/"/g, '"')})">
                <div class="card-action-bar">
                    <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart like-btn" 
                       onclick="toggleLike(event, '${item.id}', ${JSON.stringify(item).replace(/"/g, '"')})"
                       style="color: ${isLiked ? '#1db954' : 'white'}"></i>
                </div>
                <img src="${img}">
                <h4>${item.name}</h4>
                <p>${item.artists?.[0]?.name || 'Music App'}</p>
            </div>
        `;
    }).join('');
}

function play(id, type, rawData) {
    updateIntelligence(rawData, type);
    const eType = type === 'show' ? 'episode' : (type === 'playlist' ? 'playlist' : 'track');
    document.getElementById('player-container').innerHTML = 
    `<iframe src="https://open.spotify.com/embed/${eType}/${id}?utm_source=generator&theme=0" 
        width="100%" height="80" frameBorder="0" allow="autoplay; encrypted-media;" style="border-radius:15px;"></iframe>`;
}

// --- GESTÃO DE LIBRARY E BOTÕES ---
document.getElementById('btn-mais-ouvidas').onclick = () => {
    const stats = JSON.parse(localStorage.getItem('ma_stats')) || {};
    const sorted = Object.values(stats).sort((a,b) => b.count - a.count).map(s => s.data);
    search('', '', sorted);
    document.getElementById('section-title').innerText = "As Tuas Mais Ouvidas";
};

document.getElementById('btn-favoritos').onclick = () => {
    const favs = JSON.parse(localStorage.getItem('ma_favs')) || [];
    search('', '', favs);
    document.getElementById('section-title').innerText = "Músicas Favoritas";
};

document.getElementById('btn-historico').onclick = () => {
    const history = JSON.parse(localStorage.getItem('ma_history')) || [];
    search('', '', history);
    document.getElementById('section-title').innerText = "Máquina do Tempo";
};

function criarPlaylist() {
    const nome = prompt("Nome da Playlist:");
    if (nome) {
        let pl = JSON.parse(localStorage.getItem('ma_playlists')) || [];
        pl.push(nome);
        localStorage.setItem('ma_playlists', JSON.stringify(pl));
        carregarPlaylists();
    }
}

function carregarPlaylists() {
    const list = document.getElementById('minhas-playlists-list');
    const pl = JSON.parse(localStorage.getItem('ma_playlists')) || [];
    list.innerHTML = pl.map((n, i) => `
        <div class="user-playlist-item" onclick="search('${n}', 'playlist')">
            <span><i class="fa-solid fa-music"></i> ${n}</span>
            <i class="fa-solid fa-trash trash-btn" onclick="deletePlaylist(${i}, event)"></i>
        </div>
    `).join('');
}

function deletePlaylist(index, e) {
    e.stopPropagation();
    let pl = JSON.parse(localStorage.getItem('ma_playlists'));
    pl.splice(index, 1);
    localStorage.setItem('ma_playlists', JSON.stringify(pl));
    carregarPlaylists();
}

document.getElementById('termoPesquisa').onkeypress = (e) => {
    if(e.key === 'Enter') search(e.target.value);
};

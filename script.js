document.addEventListener('DOMContentLoaded', carregarPlaylists);

async function search(query, type = 'track') {
    const resToken = await fetch('/api/get-token');
    const { access_token } = await resToken.json();
    
    // Identifica se é Máquina do Tempo para aplicar o efeito visual
    const isRetro = query.includes('Flashback');

    const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=16`, {
        headers: { Authorization: 'Bearer ' + access_token }
    });
    const data = await res.json();
    const items = data.tracks?.items || data.playlists?.items || data.shows?.items || [];
    
    const grid = document.getElementById('listaResultados');
    grid.innerHTML = items.map(item => `
        <div class="music-card ${isRetro ? 'card-retro' : ''}" onclick="play('${item.id}', '${type}')">
            <div class="add-btn" onclick="adicionarMusica(event, '${item.name.replace(/'/g, "")}')">+</div>
            <img src="${item.images?.[0]?.url || item.album?.images?.[0]?.url || 'https://via.placeholder.com/300'}">
            <h4>${item.name}</h4>
            <p>${item.artists?.[0]?.name || 'Playlist'}</p>
        </div>
    `).join('');
}

function play(id, type) {
    const embedType = type === 'show' ? 'episode' : type;
    document.getElementById('player-container').innerHTML = 
    `<iframe src="https://open.spotify.com/embed/${embedType}/${id}?theme=0" width="100%" height="80" frameBorder="0" allow="autoplay; encrypted-media;" style="border-radius:20px;"></iframe>`;
}

// --- GESTÃO DE PLAYLISTS ---

function criarPlaylist() {
    const nome = prompt("Nome da tua nova Playlist:");
    if (nome) {
        let playlists = JSON.parse(localStorage.getItem('minhasPlaylists')) || [];
        playlists.push({ nome: nome, musicas: [] });
        localStorage.setItem('minhasPlaylists', JSON.stringify(playlists));
        carregarPlaylists();
    }
}

function eliminarPlaylist(index) {
    event.stopPropagation();
    if(confirm("Queres eliminar esta playlist?")) {
        let playlists = JSON.parse(localStorage.getItem('minhasPlaylists')) || [];
        playlists.splice(index, 1);
        localStorage.setItem('minhasPlaylists', JSON.stringify(playlists));
        carregarPlaylists();
    }
}

function carregarPlaylists() {
    const lista = document.getElementById('minhas-playlists-list');
    const playlists = JSON.parse(localStorage.getItem('minhasPlaylists')) || [];
    
    lista.innerHTML = playlists.map((pl, index) => `
        <div class="user-playlist-item" onclick="search('${pl.nome}', 'playlist')">
            <i class="fa-solid fa-music"></i> 
            <span>${pl.nome}</span>
            <i class="fa-solid fa-trash trash-icon" onclick="eliminarPlaylist(${index})"></i>
        </div>
    `).join('');
}

// Função para adicionar música a uma playlist (simulação)
function adicionarMusica(event, nomeMusica) {
    event.stopPropagation();
    alert(`Música "${nomeMusica}" adicionada com sucesso à tua Library!`);
}

// --- EVENTOS ---

document.querySelectorAll('.nav-item').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('section-title').innerText = btn.innerText;
        search(btn.dataset.query, btn.dataset.type);
    };
});

document.getElementById('termoPesquisa').onkeypress = (e) => {
    if (e.key === 'Enter') {
        document.getElementById('section-title').innerText = "Resultados para: " + e.target.value;
        search(e.target.value, 'track');
    }
};

search('Top Hits');

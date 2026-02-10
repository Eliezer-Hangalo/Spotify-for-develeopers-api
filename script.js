document.addEventListener('DOMContentLoaded', () => {
    carregarPlaylists();
    search('Top Hits Portugal'); // Carga inicial
});

// MEMÓRIA LOCAL: Máquina do Tempo e Mais Ouvidas
function saveToHistory(item, type) {
    let history = JSON.parse(localStorage.getItem('ma_history')) || [];
    let stats = JSON.parse(localStorage.getItem('ma_stats')) || {};

    // 1. Atualiza Máquina do Tempo (sem duplicados)
    history = history.filter(i => i.id !== item.id);
    history.unshift({ ...item, type });
    if (history.length > 20) history.pop();
    localStorage.setItem('ma_history', JSON.stringify(history));

    // 2. Atualiza Mais Ouvidas (contador)
    stats[item.id] = { 
        count: (stats[item.id]?.count || 0) + 1, 
        data: item, 
        type: type 
    };
    localStorage.setItem('ma_stats', JSON.stringify(stats));
}

async function search(query, type = 'track', forceItems = null) {
    const grid = document.getElementById('listaResultados');
    let items = forceItems;

    if (!items) {
        try {
            const resT = await fetch('/api/get-token');
            const { access_token } = await resT.json();
            const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=18`, {
                headers: { Authorization: 'Bearer ' + access_token }
            });
            const data = await res.json();
            items = data.tracks?.items || data.playlists?.items || data.shows?.items || [];
        } catch (e) {
            grid.innerHTML = '<p style="padding:20px;">Erro ao ligar ao servidor de música.</p>';
            return;
        }
    }

    grid.innerHTML = items.map(item => `
        <div class="music-card" onclick="play('${item.id}', '${item.type || type}', ${JSON.stringify(item).replace(/"/g, '&quot;')})">
            <img src="${item.images?.[0]?.url || item.album?.images?.[0]?.url || 'https://via.placeholder.com/300'}">
            <h4>${item.name}</h4>
            <p>${item.artists?.[0]?.name || 'Music App Collection'}</p>
        </div>
    `).join('');
}

function play(id, type, rawData) {
    saveToHistory(rawData, type);
    const embedType = type === 'show' ? 'episode' : (type === 'playlist' ? 'playlist' : 'track');
    const container = document.getElementById('player-container');
    
    container.innerHTML = `
        <iframe src="https://open.spotify.com/embed/${embedType}/${id}?utm_source=generator&theme=0" 
            width="100%" height="80" frameBorder="0" allow="autoplay; encrypted-media;" 
            style="border-radius:20px;"></iframe>
    `;
}

// GESTÃO DE PLAYLISTS
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
            <span><i class="fa-solid fa-music" style="font-size:10px; margin-right:10px;"></i> ${n}</span>
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

// BOTÕES DE LIBRARY (Mais Ouvidas e Histórico)
document.getElementById('btn-mais-ouvidas').onclick = function() {
    const stats = JSON.parse(localStorage.getItem('ma_stats')) || {};
    const sorted = Object.values(stats)
        .sort((a,b) => b.count - a.count)
        .map(s => s.data);
    
    toggleActive(this);
    document.getElementById('section-title').innerText = "As Tuas Mais Ouvidas";
    search('', '', sorted);
};

document.getElementById('btn-historico').onclick = function() {
    const history = JSON.parse(localStorage.getItem('ma_history')) || [];
    
    toggleActive(this);
    document.getElementById('section-title').innerText = "Máquina do Tempo (Histórico)";
    search('', '', history);
};

function toggleActive(element) {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    element.classList.add('active');
}

// EVENTOS DE PESQUISA E MENU
document.querySelectorAll('.nav-item').forEach(btn => {
    if(!btn.id) { // Só para itens normais de pesquisa
        btn.onclick = () => {
            toggleActive(btn);
            document.getElementById('section-title').innerText = btn.innerText;
            search(btn.dataset.query, btn.dataset.type);
        };
    }
});

document.getElementById('termoPesquisa').onkeypress = (e) => {
    if(e.key === 'Enter') {
        document.getElementById('section-title').innerText = "Resultados";
        search(e.target.value);
    }
};

// Variável global para controlar a cor de destaque (começa com o verde Spotify)
let accentColor = '#1db954';

/**
 * 1. Procura o Token de acesso através da sua API na Vercel
 * Isto esconde o seu Client ID e Client Secret do navegador.
 */
async function getAccessToken() {
    try {
        const response = await fetch('/api/get-token');
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("Erro ao obter o token:", error);
    }
}

/**
 * 2. Função principal de pesquisa
 * @param {string} query - O que pesquisar
 * @param {string} type - Tipo de conteúdo (track, show, playlist)
 */
async function searchSpotify(query, type = 'track') {
    const token = await getAccessToken();
    if (!token) return;

    // Atualiza a cor de destaque no CSS dinamicamente
    document.documentElement.style.setProperty('--accent', accentColor);
    
    // Atualiza o título da secção
    const sectionTitle = document.getElementById('section-title');
    sectionTitle.style.color = accentColor;
    sectionTitle.innerText = query;

    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=12`, {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    
    const data = await response.json();
    
    // Organiza os itens dependendo do que o Spotify devolveu
    const items = data.tracks?.items || data.playlists?.items || data.shows?.items || [];
    renderResults(items, type);
}

/**
 * 3. Renderiza os cartões de música na grelha HTML
 */
function renderResults(items, type) {
    const grid = document.getElementById('listaResultados');
    grid.innerHTML = '';
    
    if (items.length === 0) {
        grid.innerHTML = '<p style="color: #666;">Nenhum resultado encontrado.</p>';
        return;
    }

    items.forEach(item => {
        // O Spotify coloca imagens em locais diferentes dependendo do tipo de conteúdo
        const image = item.images?.[0]?.url || item.album?.images?.[0]?.url || 'https://via.placeholder.com/300';
        const subText = item.artists?.[0]?.name || item.publisher || 'Spotify Content';
        
        const div = document.createElement('div');
        div.className = 'music-card';
        div.innerHTML = `
            <img src="${image}" alt="${item.name}">
            <h4>${item.name}</h4>
            <p>${subText}</p>
        `;
        
        // Ao clicar, envia para o player
        div.onclick = () => playMedia(item.id, type);
        grid.appendChild(div);
    });
}

/**
 * 4. Carrega o Embed do Spotify no rodapé (Player Bar)
 */
function playMedia(id, type) {
    const container = document.getElementById('player-container');
    
    // Ajusta o tipo para o link do Embed
    let embedType = 'track';
    if (type === 'show') embedType = 'show';
    if (type === 'playlist') embedType = 'playlist';

    container.innerHTML = `
        <iframe 
            src="https://open.spotify.com/embed/${embedType}/${id}?utm_source=generator&theme=0" 
            width="100%" 
            height="80" 
            frameBorder="0" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            style="border-radius: 12px;">
        </iframe>`;
}

/**
 * 5. Configuração dos Eventos (Cliques e Teclado)
 */

// Lógica para os botões da barra lateral
document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
        // 1. Remove classe ativa de todos e coloca no clicado
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        btn.classList.add('active');
        
        // 2. Pega a cor e o tipo definidos no HTML (data-attributes)
        accentColor = btn.getAttribute('data-color');
        const type = btn.getAttribute('data-type');
        const query = btn.querySelector('span').innerText;

        // 3. Executa a pesquisa
        searchSpotify(query, type);
    });
});

// Lógica para a barra de pesquisa (Enter)
document.getElementById('termoPesquisa').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        accentColor = '#1db954'; // Volta para o verde padrão na pesquisa manual
        searchSpotify(e.target.value, 'track');
    }
});

// 6. Carregamento inicial (O que aparece mal o site abre)
window.onload = () => {
    searchSpotify('Top Global Hits', 'track');
};
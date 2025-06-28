const API_BASE_URL = 'http://localhost:8080/api';
const AUTH_BASE_URL = 'http://localhost:8080/auth';

let userToken = localStorage.getItem('jwtToken');
let loggedInUser = null;

// Session ID para usuários anônimos
let sessionId = localStorage.getItem('sessionId');
if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('sessionId', sessionId);
}

// Elementos do DOM
const imagemElement = document.getElementById("imagemDoJogo");
const inputJogo = document.getElementById("inputJogo");
const mensagem = document.getElementById("mensagem");
const listaJogos = document.getElementById("listaJogos");
const remainingGuessesElement = document.getElementById("remainingGuesses");
const frameNavigation = document.getElementById("frameNavigation");
const userProfileDiv = document.getElementById("userProfile");
const challengeDateElement = document.getElementById("challengeDate");
const rankingListElement = document.getElementById("rankingList");
const suggestionsDatalist = document.getElementById('suggestions');

// Modais e formulários
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');

document.addEventListener('DOMContentLoaded', () => {
    checkUserLoginStatus();
    fetchDailyChallenge();
    fetchWeeklyRanking();

    inputJogo.addEventListener('input', handleInputChange);
    inputJogo.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitGuess();
        }
    });
});

// Verifica se usuário está logado e atualiza UI
async function checkUserLoginStatus() {
    if (userToken) {
        try {
            const response = await fetch(`${AUTH_BASE_URL}/profile`, {
                headers: { 'Authorization': `Bearer ${userToken}` }
            });
            if (response.ok) {
                loggedInUser = await response.json();
                displayUserProfile(loggedInUser.name || loggedInUser.email);
            } else {
                clearUserSession();
            }
        } catch {
            clearUserSession();
        }
    } else {
        displayLoginButton();
    }
}

function displayUserProfile(username) {
    userProfileDiv.innerHTML = `<span>Olá, ${username}!</span> <button onclick="logout()">Sair</button>`;
}

function displayLoginButton() {
    userProfileDiv.innerHTML = `<button onclick="showLogin()">Login</button>`;
}

function clearUserSession() {
    localStorage.removeItem('jwtToken');
    userToken = null;
    loggedInUser = null;
    displayLoginButton();
}

async function login(email, password) {
    try {
        const response = await fetch(`${AUTH_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('jwtToken', data.token);
            userToken = data.token;
            await checkUserLoginStatus();
            await fetchDailyChallenge();
            closeModal();
            displayMessage('', 'info');
        } else {
            displayMessage(data.message || "Credenciais inválidas.", "error");
        }
    } catch {
        displayMessage("Erro ao conectar com o servidor.", "error");
    }
}

async function register(name, email, password) {
    try {
        const response = await fetch(`${AUTH_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('jwtToken', data.token);
            userToken = data.token;
            await checkUserLoginStatus();
            await fetchDailyChallenge();
            closeModal();
            displayMessage('', 'info');
        } else {
            displayMessage(data.message || "Erro ao registrar.", "error");
        }
    } catch {
        displayMessage("Erro ao conectar com o servidor.", "error");
    }
}

function logout() {
    clearUserSession();
    location.reload();
}

function showLogin() {
    loginModal.style.display = 'flex';
    registerModal.style.display = 'none';
    loginMessage.textContent = '';
    loginForm.reset();
}

function showRegister() {
    registerModal.style.display = 'flex';
    loginModal.style.display = 'none';
    registerMessage.textContent = '';
    registerForm.reset();
}

function closeModal() {
    loginModal.style.display = 'none';
    registerModal.style.display = 'none';
}

loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    login(email, password);
});

registerForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    register(name, email, password);
});

function formatDateWithoutTimezone(dateString) {
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
}

function getHeadersForRoute(route, isJson = false) {
    const publicRoutes = ['/today', '/challenge/today', '/auth/login', '/auth/register'];
    let headers = {};
    if (isJson) headers['Content-Type'] = 'application/json';

    if (!publicRoutes.some(r => route.startsWith(r))) {
        if (userToken) headers['Authorization'] = `Bearer ${userToken}`;
    }
    return headers;
}

async function fetchDailyChallenge() {
    try {
        const headers = getHeadersForRoute('/challenge/today');
        headers['X-Session-ID'] = sessionId;

        const response = await fetch(`${API_BASE_URL}/challenge/today`, { headers });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const currentChallenge = await response.json();

        challengeDateElement.textContent = `Desafio de ${formatDateWithoutTimezone(currentChallenge.date)}`;
        imagemElement.src = `http://localhost:8080/image/proxy?url=${encodeURIComponent(currentChallenge.frames[0])}`;
        remainingGuessesElement.textContent = `Tentativas restantes: ${currentChallenge.remainingGuesses}`;
        renderFrameButtons(5 - currentChallenge.remainingGuesses);

        listaJogos.innerHTML = '';
        updateGameState(currentChallenge.remainingGuesses, false);
        displayMessage('', 'info');
    } catch {
        displayMessage("Não foi possível carregar o desafio de hoje.", "error");
        inputJogo.disabled = true;
        document.querySelector('.game button').disabled = true;
    }
}

async function submitGuess() {
    const guess = inputJogo.value.trim();
    if (!guess) {
        displayMessage("Por favor, digite um palpite!", "error");
        return;
    }

    inputJogo.disabled = true;
    document.querySelector('.game button').disabled = true;

    try {
        const headers = { 'Content-Type': 'application/json', 'X-Session-ID': sessionId };
        if (userToken) headers['Authorization'] = `Bearer ${userToken}`;

        const response = await fetch(`${API_BASE_URL}/challenge/try`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ guess })
        });

        if (response.status === 400) {
            const errorData = await response.json();
            displayMessage(errorData.message || "Erro ao processar o palpite.", "error");
            enableInput();
            return;
        }

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();

        const newGuessItem = document.createElement("li");
        newGuessItem.textContent = guess;

        if (result.isCorrect) {
            displayMessage(`Parabéns! Você acertou: ${result.challengeAnswer}!`, "success");
            newGuessItem.classList.add('correct-guess');
            imagemElement.src = result.currentFrame;
            disableInput();
        } else {
            displayMessage("Você errou. Tente novamente!", "error");
            newGuessItem.classList.add('incorrect-guess');
            imagemElement.src = result.currentFrame;
            remainingGuessesElement.textContent = `Tentativas restantes: ${result.remainingGuesses}`;
            renderFrameButtons(result.order + 1);

            if (result.remainingGuesses === 0) {
                displayMessage(`Suas tentativas acabaram! O desenho era: ${result.challengeAnswer}`, "error");
                disableInput();
            } else {
                enableInput();
            }
        }

        listaJogos.prepend(newGuessItem);
        inputJogo.value = "";
        updateGameState(result.remainingGuesses, result.isCorrect);

    } catch {
        displayMessage("Erro ao enviar palpite.", "error");
        enableInput();
    }
}

function disableInput() {
    inputJogo.disabled = true;
    document.querySelector('.game button').disabled = true;
}

function enableInput() {
    inputJogo.disabled = false;
    document.querySelector('.game button').disabled = false;
}

function renderFrameButtons(numFramesShown) {
    frameNavigation.innerHTML = '';
    for (let i = 0; i < numFramesShown; i++) {
        const btn = document.createElement('button');
        btn.textContent = i + 1;
        btn.onclick = () => showSpecificFrame(i);
        frameNavigation.appendChild(btn);
    }
}

function showSpecificFrame(frameIndex) {
    // Se tiver desafio e frames
    if (!imagemElement) return;
    fetch(`${API_BASE_URL}/challenge/today`, {
        headers: { 'X-Session-ID': sessionId, ...getHeadersForRoute('/challenge/today') }
    })
    .then(r => r.json())
    .then(data => {
        if (data.frames && data.frames[frameIndex]) {
            imagemElement.src = data.frames[frameIndex];
        }
    });
}

function updateGameState(remainingGuesses, isCorrect) {
    const gameOver = isCorrect || remainingGuesses <= 0;
    if (gameOver) disableInput();
    else enableInput();
}

function displayMessage(text, type) {
    mensagem.textContent = text;
    mensagem.className = `message ${type}`;
}

async function handleInputChange() {
    const input = inputJogo.value.trim().toLowerCase();
    suggestionsDatalist.innerHTML = '';

    if (input.length < 2) return;

    const cartoons = [
        "Avatar: A Lenda de Aang", "Apenas um Show", "As Meninas Superpoderosas", "Ben 10",
        "Bob Esponja Calça Quadrada", "Caverna do Dragão", "Corrida Maluca", "Du, Dudu e Edu",
        "O Incrível Mundo de Gumball", "Os Simpsons", "Hora de Aventura", "Tom e Jerry",
        "Pernalonga", "Os Flintstones", "Looney Tunes", "Scooby-Doo", "Dragon Ball Z",
        "Pokémon", "Naruto", "Steven Universo", "Rick e Morty", "Gravity Falls",
        "Star vs. as Forças do Mal", "Kim Possible", "Phineas e Ferb", "A Família Addams",
        "Batman: A Série Animada", "Superman: A Série Animada", "Liga da Justiça",
        "X-Men: Evolution", "DuckTales", "Animaniacs", "Pinky e o Cérebro",
        "Hey Arnold!", "Rugrats", "A Turma da Mônica", "Jem e as Hologramas",
        "She-Ra: A Princesa do Poder", "He-Man e os Mestres do Universo", "ThunderCats",
        "Cavaleiros do Zodíaco", "Sailor Moon", "Digimon", "Yu-Gi-Oh!",
        "As Aventuras de Jackie Chan", "Coragem, o Cão Covarde", "Laboratório de Dexter",
        "A Vaca e o Frango"
    ];

    const filtered = cartoons.filter(c => c.toLowerCase().includes(input));

    filtered.forEach(s => {
        const option = document.createElement('option');
        option.value = s;
        suggestionsDatalist.appendChild(option);
    });
}

async function fetchWeeklyRanking() {
    try {
        const response = await fetch(`${API_BASE_URL}/ranking/weekly`, {
            headers: getHeadersForRoute('/ranking/weekly')
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const rankingData = await response.json();
        rankingListElement.innerHTML = '';

        if (rankingData.length > 0) {
            rankingData.forEach((user, i) => {
                const li = document.createElement('li');
                li.textContent = `${i + 1}. ${user.name || user.email} - ${user.score} pontos`;
                rankingListElement.appendChild(li);
            });
        } else {
            rankingListElement.innerHTML = '<li>Nenhum dado de ranking disponível.</li>';
        }
    } catch {
        rankingListElement.innerHTML = '<li>Erro ao carregar ranking.</li>';
    }
}

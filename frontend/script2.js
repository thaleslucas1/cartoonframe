const API_BASE_URL = 'http://localhost:8080/api'; // Ajuste se seu backend rodar em outra porta
const AUTH_BASE_URL = 'http://localhost:8080/auth'; // Ajuste para autenticação

let currentChallenge = null; // O desafio diário atual
let userToken = localStorage.getItem('jwtToken'); // Obtém o token JWT do armazenamento local
let sessionId = localStorage.getItem('sessionId'); // <--- NOVO: Obtém o sessionId do armazenamento local
let loggedInUser = null; // Informações do usuário logado

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

// Modais
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');

/**
 * Função para formatar a data ignorando o timezone,
 * retornando a data no formato DD/MM/YYYY exatamente da string ISO recebida
 */
function formatDateWithoutTimezone(dateString) {
    // Considera somente a parte da data ISO (yyyy-mm-dd)
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Função que retorna os headers adequados para a rota.
 * Adiciona Authorization (JWT) e, opcionalmente, o Session-ID.
 */
function getHeadersForRoute(route, isJson = false) {
    const publicRoutes = [
        '/today',
        '/challenge/today',
        '/auth/login',
        '/auth/register'
    ];

    let headers = {};

    if (isJson) {
        headers['Content-Type'] = 'application/json';
    }

    if (!publicRoutes.some(publicRoute => route.startsWith(publicRoute))) {
        if (userToken) {
            headers['Authorization'] = `Bearer ${userToken}`;
        }
        // <--- NOVO: Adiciona o Session-ID se existir e não for rota pública
        if (sessionId) {
            headers['X-Session-ID'] = sessionId; // Exemplo de cabeçalho customizado
        }
    }

    return headers;
}

// Listeners de Eventos
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

async function checkUserLoginStatus() {
    if (userToken) {
        try {
            const response = await fetch(`${AUTH_BASE_URL}/profile`, {
                headers: getHeadersForRoute('/profile')
            });
            if (response.ok) {
                loggedInUser = await response.json();
                displayUserProfile(loggedInUser.name || loggedInUser.email);
            } else {
                console.error("Falha ao buscar perfil do usuário, token inválido ou expirado. Status:", response.status);
                clearUserSession();
            }
        } catch (error) {
            console.error("Erro ao verificar status de login do usuário:", error);
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
    localStorage.removeItem('sessionId'); // <--- NOVO: Remove o sessionId
    userToken = null;
    sessionId = null; // <--- NOVO: Limpa o sessionId
    loggedInUser = null;
    displayLoginButton();
}

async function login(email, password) {
    try {
        const response = await fetch(`${AUTH_BASE_URL}/login`, {
            method: 'POST',
            headers: getHeadersForRoute('/login', true),
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('jwtToken', data.token);
            userToken = data.token;
            if (data.sessionId) { // <--- NOVO: Se o backend retornar um sessionId
                localStorage.setItem('sessionId', data.sessionId);
                sessionId = data.sessionId;
            }
            await checkUserLoginStatus();
            await fetchDailyChallenge();
            closeModal();
            displayMessage('', 'info');
        } else {
            displayMessage(data.message || "Credenciais inválidas. Verifique seu email e senha.", "error");
        }
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        displayMessage("Erro ao conectar com o servidor. Tente novamente mais tarde.", "error");
    }
}

async function register(name, email, password) {
    try {
        const response = await fetch(`${AUTH_BASE_URL}/register`, {
            method: 'POST',
            headers: getHeadersForRoute('/register', true),
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('jwtToken', data.token);
            userToken = data.token;
            if (data.sessionId) { // <--- NOVO: Se o backend retornar um sessionId
                localStorage.setItem('sessionId', data.sessionId);
                sessionId = data.sessionId;
            }
            await checkUserLoginStatus();
            await fetchDailyChallenge();
            closeModal();
            displayMessage('', 'info');
        } else {
            displayMessage(data.message || "Erro ao registrar usuário. Tente outro email.", "error");
        }
    } catch (error) {
        console.error("Erro ao registrar:", error);
        displayMessage("Erro ao conectar com o servidor. Tente novamente mais tarde.", "error");
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

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    login(email, password);
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    register(name, email, password);
});

async function fetchDailyChallenge() {
    try {
        const response = await fetch(`${API_BASE_URL}/challenge/today`, {
            headers: getHeadersForRoute('/challenge/today')
        });
        if (!response.ok) {
            throw new Error(`Erro HTTP! status: ${response.status}`);
        }
        currentChallenge = await response.json();

        // Usa a nova função para formatar data sem timezone
        challengeDateElement.textContent = `Desafio de ${formatDateWithoutTimezone(currentChallenge.date)}`;

        imagemElement.src = `http://localhost:8080/image/proxy?url=${encodeURIComponent(currentChallenge.frames[0])}`;
        remainingGuessesElement.textContent = `Tentativas restantes: ${currentChallenge.remainingGuesses}`;

        renderFrameButtons(5 - currentChallenge.remainingGuesses);
        listaJogos.innerHTML = "";
        updateGameState(currentChallenge.remainingGuesses, false);
        displayMessage('', 'info');
    } catch (error) {
        console.error("Erro ao buscar o desafio diário:", error);
        displayMessage("Não foi possível carregar o desafio de hoje. Tente novamente mais tarde.", "error");
        inputJogo.disabled = true;
        document.querySelector('.game button').disabled = true;
    }
}

async function submitGuess() {
    const guess = inputJogo.value.trim();
    if (guess === "") {
        displayMessage("Por favor, digite um palpite!", "error");
        return;
    }

    // Atualiza o token e o sessionId antes de usar
    let userToken = localStorage.getItem('jwtToken');
    let sessionId = localStorage.getItem('sessionId'); // <--- NOVO: Obtém o sessionId

    // Desabilita input e botão temporariamente
    inputJogo.disabled = true;
    document.querySelector('.game button').disabled = true;

    try {
        const headers = { 'Content-Type': 'application/json' };

        // Só adiciona Authorization se token válido
        if (userToken && userToken !== 'null') {
            headers['Authorization'] = `Bearer ${userToken}`;
        }
        // <--- NOVO: Adiciona o Session-ID se existir
        if (sessionId && sessionId !== 'null') {
            headers['X-Session-ID'] = sessionId;
        }

        const response = await fetch(`${API_BASE_URL}/challenge/try`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ guess: guess }) // Envia palpite
        });

        if (response.status === 400) {
            const errorData = await response.json();
            displayMessage(errorData.message || "Erro ao processar o palpite.", "error");
            inputJogo.disabled = false;
            document.querySelector('.game button').disabled = false;
            return;
        }

        if (!response.ok) {
            throw new Error(`Erro HTTP! status: ${response.status}`);
        }

        const result = await response.json();

        let newGuessItem = document.createElement("li");
        newGuessItem.textContent = guess;

        if (result.isCorrect) {
            displayMessage(`Parabéns! Você acertou: ${result.challengeAnswer}!`, "success");
            newGuessItem.classList.add('correct-guess');
            imagemElement.src = result.currentFrame;
            inputJogo.disabled = true;
            document.querySelector('.game button').disabled = true;
        } else {
            displayMessage("Você errou. Tente novamente!", "error");
            newGuessItem.classList.add('incorrect-guess');
            imagemElement.src = result.currentFrame;
            remainingGuessesElement.textContent = `Tentativas restantes: ${result.remainingGuesses}`;
            renderFrameButtons(result.order + 1);

            if (result.remainingGuesses === 0 && !result.isCorrect) {
                displayMessage(`Suas tentativas acabaram! O desenho era: ${result.challengeAnswer}`, "error");
                inputJogo.disabled = true;
                document.querySelector('.game button').disabled = true;
            } else {
                inputJogo.disabled = false;
                document.querySelector('.game button').disabled = false;
            }
        }

        listaJogos.prepend(newGuessItem);
        inputJogo.value = "";
        updateGameState(result.remainingGuesses, result.isCorrect);

    } catch (error) {
        console.error("Erro ao enviar palpite:", error);
        displayMessage("Ocorreu um erro ao processar seu palpite.", "error");
        inputJogo.disabled = false;
        document.querySelector('.game button').disabled = false;
    }
}

function renderFrameButtons(numFramesShown) {
    frameNavigation.innerHTML = '';
    for (let i = 0; i < numFramesShown; i++) {
        const button = document.createElement('button');
        button.textContent = i + 1;
        button.onclick = () => showSpecificFrame(i);
        frameNavigation.appendChild(button);
    }
}

function showSpecificFrame(frameIndex) {
    if (currentChallenge && currentChallenge.frames && currentChallenge.frames[frameIndex]) {
        imagemElement.src = currentChallenge.frames[frameIndex];
    }
}

function renderPreviousGuesses(guesses = []) {
    // Mantido mas não usado porque não há dados do backend ainda
}

function updateGameState(remainingGuesses, isCorrect) {
    const isGameOver = isCorrect || remainingGuesses <= 0;
    inputJogo.disabled = isGameOver;
    document.querySelector('.game button').disabled = isGameOver;
}

function displayMessage(text, type) {
    mensagem.textContent = text;
    mensagem.className = `message ${type}`;
}

async function handleInputChange() {
    const input = inputJogo.value.trim().toLowerCase();
    suggestionsDatalist.innerHTML = '';

    if (input.length < 2) {
        return;
    }

    const potentialCartoonAnswers = [
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

    const filteredSuggestions = potentialCartoonAnswers.filter(cartoon =>
        cartoon.toLowerCase().includes(input)
    );

    filteredSuggestions.forEach(suggestion => {
        const option = document.createElement('option');
        option.value = suggestion;
        suggestionsDatalist.appendChild(option);
    });
}

async function fetchWeeklyRanking() {
    try {
        const response = await fetch(`${API_BASE_URL}/ranking/weekly`, {
            headers: getHeadersForRoute('/ranking/weekly')
        });
        if (!response.ok) {
            throw new Error(`Erro HTTP! status: ${response.status}`);
        }
        const rankingData = await response.json();

        rankingListElement.innerHTML = '';
        if (rankingData && rankingData.length > 0) {
            rankingData.forEach((user, index) => {
                let listItem = document.createElement('li');
                listItem.textContent = `${index + 1}. ${user.name || user.email} - ${user.score} pontos`;
                rankingListElement.appendChild(listItem);
            });
        } else {
            rankingListElement.innerHTML = '<li>Nenhum dado de ranking disponível.</li>';
        }
    } catch (error) {
        console.error("Erro ao buscar ranking semanal:", error);
        rankingListElement.innerHTML = '<li>Erro ao carregar ranking.</li>';
    }
}

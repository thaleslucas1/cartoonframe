const API_BASE_URL = 'http://localhost:8080/api'; // Ajuste se seu backend rodar em outra porta
const AUTH_BASE_URL = 'http://localhost:8080/auth'; // Ajuste para autenticação
const PASSWORD_RESET_BASE_URL = 'http://localhost:8080/password-reset'; // Novo endpoint para redefinição de senha

let currentChallenge = null;
let userToken = localStorage.getItem('jwtToken');
let loggedInUser = null;
let currentResetEmail = null; // Para armazenar o email durante o fluxo de redefinição de senha

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

// Modals
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const forgotPasswordModal = document.getElementById('forgotPasswordModal'); // Novo
const resetCodeModal = document.getElementById('resetCodeModal');         // Novo
const newPasswordModal = document.getElementById('newPasswordModal');     // Novo

// Forms
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm'); // Novo
const resetCodeForm = document.getElementById('resetCodeForm');         // Novo
const newPasswordForm = document.getElementById('newPasswordForm');     // Novo

// Messages
const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');
const forgotMessage = document.getElementById('forgotMessage');         // Novo
const resetCodeMessage = document.getElementById('resetCodeMessage');   // Novo
const newPasswordMessage = document.getElementById('newPasswordMessage'); // Novo

/**
 * Função para formatar a data ignorando o timezone,
 * retornando a data no formato DD/MM/YYYY exatamente da string ISO recebida
 */
function formatDateWithoutTimezone(dateString) {
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Função que retorna os headers adequados para a rota.
 * Não adiciona Authorization em rotas públicas.
 * @param {string} fullRoute - A rota completa que está sendo chamada (e.g., 'http://localhost:8080/api/challenge/today').
 * @param {boolean} isJson - Indica se o Content-Type deve ser 'application/json'.
 * @returns {Object} Headers para a requisição.
 */
function getHeadersForRoute(fullRoute, isJson = false) {
    const publicRoutes = [
        `${API_BASE_URL}/challenge/today`,
        `${API_BASE_URL}/challenge/ranking/weekly`,
        `${AUTH_BASE_URL}/login`,
        `${AUTH_BASE_URL}/register`,
        `${PASSWORD_RESET_BASE_URL}/request-code`, // Nova rota pública
        `${PASSWORD_RESET_BASE_URL}/confirm-code`, // Nova rota pública
        `${PASSWORD_RESET_BASE_URL}/reset-password` // Nova rota pública
    ];

    let headers = {};

    if (isJson) {
        headers['Content-Type'] = 'application/json';
    }

    if (!publicRoutes.includes(fullRoute)) {
        if (userToken && userToken !== 'null' && userToken !== 'undefined') {
            headers['Authorization'] = `Bearer ${userToken}`;
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
                headers: getHeadersForRoute(`${AUTH_BASE_URL}/profile`)
            });
            if (response.ok) {
                loggedInUser = await response.json();
                displayUserProfile(loggedInUser.name || loggedInUser.nickname || loggedInUser.email); // Adicionado nickname
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
    userToken = null;
    loggedInUser = null;
    displayLoginButton();
}

async function login(identifier, password) { // 'identifier' pode ser email ou nickname
    try {
        const response = await fetch(`${AUTH_BASE_URL}/login`, {
            method: 'POST',
            headers: getHeadersForRoute(`${AUTH_BASE_URL}/login`, true),
            body: JSON.stringify({ identifier, password }) // Envia identificador (email ou nickname)
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
            displayMessage(data.message || "Credenciais inválidas. Verifique seu email/nickname e senha.", "error", loginMessage);
        }
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        displayMessage("Erro ao conectar com o servidor. Tente novamente mais tarde.", "error", loginMessage);
    }
}

async function register(name, nickname, email, password) { // Adicionado 'nickname'
    try {
        const response = await fetch(`${AUTH_BASE_URL}/register`, {
            method: 'POST',
            headers: getHeadersForRoute(`${AUTH_BASE_URL}/register`, true),
            body: JSON.stringify({ name, nickname, email, password }) // Envia nickname
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('jwtToken', data.token);
            userToken = data.token;
            await checkUserLoginStatus();
            await fetchDailyChallenge();
            closeModal();
            displayMessage('', 'info', registerMessage);
        } else {
            displayMessage(data.message || "Erro ao registrar usuário. Tente outro email ou nickname.", "error", registerMessage);
        }
    } catch (error) {
        console.error("Erro ao registrar:", error);
        displayMessage("Erro ao conectar com o servidor. Tente novamente mais tarde.", "error", registerMessage);
    }
}

// --- Funções para o fluxo de "Esqueceu a Senha" ---
async function requestPasswordResetCode(email) {
    try {
        const response = await fetch(`${PASSWORD_RESET_BASE_URL}/request-code`, {
            method: 'POST',
            headers: getHeadersForRoute(`${PASSWORD_RESET_BASE_URL}/request-code`, true),
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (response.ok) {
            currentResetEmail = email; // Armazena o email para as próximas etapas
            displayMessage(data.message || "Código de redefinição enviado para seu email.", "success", forgotMessage);
            setTimeout(showResetCodeForm, 1500); // Mostra a próxima tela após um breve atraso
        } else {
            displayMessage(data.message || "Erro ao solicitar código. Verifique o email.", "error", forgotMessage);
        }
    } catch (error) {
        console.error("Erro ao solicitar código de redefinição:", error);
        displayMessage("Erro ao conectar com o servidor.", "error", forgotMessage);
    }
}

async function confirmPasswordResetCode(code) {
    if (!currentResetEmail) {
        displayMessage("Por favor, comece o processo de redefinição de senha novamente.", "error", resetCodeMessage);
        showForgotPassword();
        return;
    }
    try {
        const response = await fetch(`${PASSWORD_RESET_BASE_URL}/confirm-code`, {
            method: 'POST',
            headers: getHeadersForRoute(`${PASSWORD_RESET_BASE_URL}/confirm-code`, true),
            body: JSON.stringify({ email: currentResetEmail, code })
        });
        const data = await response.json();
        if (response.ok) {
            displayMessage(data.message || "Código confirmado com sucesso!", "success", resetCodeMessage);
            setTimeout(showNewPasswordForm, 1500); // Mostra a tela de nova senha
        } else {
            displayMessage(data.message || "Código inválido ou expirado.", "error", resetCodeMessage);
        }
    } catch (error) {
        console.error("Erro ao confirmar código:", error);
        displayMessage("Erro ao conectar com o servidor.", "error", resetCodeMessage);
    }
}

async function resetPassword(newPassword, confirmNewPassword) {
    if (newPassword !== confirmNewPassword) {
        displayMessage("As senhas não coincidem.", "error", newPasswordMessage);
        return;
    }
    if (!currentResetEmail) {
        displayMessage("Erro: email não registrado para redefinição. Comece novamente.", "error", newPasswordMessage);
        showForgotPassword();
        return;
    }
    try {
        const response = await fetch(`${PASSWORD_RESET_BASE_URL}/reset-password`, {
            method: 'POST',
            headers: getHeadersForRoute(`${PASSWORD_RESET_BASE_URL}/reset-password`, true),
            body: JSON.stringify({ email: currentResetEmail, newPassword })
        });
        const data = await response.json();
        if (response.ok) {
            displayMessage(data.message || "Senha redefinida com sucesso! Redirecionando para login...", "success", newPasswordMessage);
            currentResetEmail = null; // Limpa o email de reset
            setTimeout(showLogin, 2000); // Volta para a tela de login
        } else {
            displayMessage(data.message || "Erro ao redefinir senha.", "error", newPasswordMessage);
        }
    } catch (error) {
        console.error("Erro ao redefinir senha:", error);
        displayMessage("Erro ao conectar com o servidor.", "error", newPasswordMessage);
    }
}

// --- Funções de exibição de Modais ---
function showLogin() {
    loginModal.style.display = 'flex';
    registerModal.style.display = 'none';
    forgotPasswordModal.style.display = 'none';
    resetCodeModal.style.display = 'none';
    newPasswordModal.style.display = 'none';
    loginMessage.textContent = ''; // Clear previous messages
    loginForm.reset();
}

function showRegister() {
    registerModal.style.display = 'flex';
    loginModal.style.display = 'none';
    forgotPasswordModal.style.display = 'none';
    resetCodeModal.style.display = 'none';
    newPasswordModal.style.display = 'none';
    registerMessage.textContent = ''; // Clear previous messages
    registerForm.reset();
}

function showForgotPassword() {
    forgotPasswordModal.style.display = 'flex';
    loginModal.style.display = 'none';
    registerModal.style.display = 'none';
    resetCodeModal.style.display = 'none';
    newPasswordModal.style.display = 'none';
    forgotMessage.textContent = ''; // Clear previous messages
    forgotPasswordForm.reset();
}

function showResetCodeForm() {
    resetCodeModal.style.display = 'flex';
    forgotPasswordModal.style.display = 'none';
    loginModal.style.display = 'none';
    newPasswordModal.style.display = 'none';
    resetCodeMessage.textContent = '';
    resetCodeForm.reset();
}

function showNewPasswordForm() {
    newPasswordModal.style.display = 'flex';
    resetCodeModal.style.display = 'none';
    loginModal.style.display = 'none';
    newPasswordMessage.textContent = '';
    newPasswordForm.reset();
}

function closeModal() {
    loginModal.style.display = 'none';
    registerModal.style.display = 'none';
    forgotPasswordModal.style.display = 'none';
    resetCodeModal.style.display = 'none';
    newPasswordModal.style.display = 'none';
}

// --- Listeners de submissão de formulários ---
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const identifier = document.getElementById('loginIdentifier').value; // Pode ser email ou nickname
    const password = document.getElementById('loginPassword').value;
    login(identifier, password);
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const nickname = document.getElementById('registerNickname').value; // Pega o nickname
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    register(name, nickname, email, password);
});

forgotPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value;
    requestPasswordResetCode(email);
});

resetCodeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = document.getElementById('resetCode').value;
    confirmPasswordResetCode(code);
});

newPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    resetPassword(newPassword, confirmNewPassword);
});

// --- Lógica de Jogo (Imagens e Botões) ---

async function fetchDailyChallenge() {
    try {
        const response = await fetch(`${API_BASE_URL}/challenge/today`, {
            headers: getHeadersForRoute(`${API_BASE_URL}/challenge/today`)
        });
        if (!response.ok) {
            throw new Error(`Erro HTTP! status: ${response.status}`);
        }
        currentChallenge = await response.json();

        challengeDateElement.textContent = `Desafio de ${formatDateWithoutTimezone(currentChallenge.date)}`;

        // Na carga inicial, sempre mostra o primeiro frame (índice 0)
        // E o botão '1' deve estar disponível.
        imagemElement.src = `http://localhost:8080/image/proxy?url=${encodeURIComponent(currentChallenge.frames[0])}`;
        remainingGuessesElement.textContent = `Tentativas restantes: ${currentChallenge.remainingGuesses}`;

        // Adaptação para o número de frames mostrados na carga inicial:
        // O `order` do backend na `AttemptResultDTO` representa o número de palpites feitos antes da *atual*.
        // Para a carga inicial, se o `remainingGuesses` for 5 (total de tentativas), `order` implícito é 0.
        // Se `remainingGuesses` for 4, `order` implícito é 1, etc.
        // O número de frames revelados deve ser (total de tentativas - tentativas restantes) + 1.
        // Ex: 5 tentativas totais - 5 restantes + 1 = 1 frame mostrado (no início).
        // Ex: 5 tentativas totais - 4 restantes + 1 = 2 frames mostrados (após 1 erro).
        const framesInitiallyShown = (5 - currentChallenge.remainingGuesses) + 1;
        renderFrameButtons(framesInitiallyShown); // Renderiza botões para frames já "desbloqueados"

        listaJogos.innerHTML = ""; // Limpa palpites anteriores ao carregar novo desafio (se não vierem do backend)
        updateGameState(currentChallenge.remainingGuesses, false); // Assume não resolvido na carga inicial
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

    // Desabilita input e botão temporariamente para evitar cliques múltiplos
    inputJogo.disabled = true;
    document.querySelector('.game button').disabled = true;

    try {
        const headers = getHeadersForRoute(`${API_BASE_URL}/challenge/try`, true);

        const response = await fetch(`${API_BASE_URL}/challenge/try`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ guess: guess }) // Envia palpite
        });

        // Adaptação: Lida com status 400 (Bad Request)
        if (response.status === 400) {
            const errorData = await response.json();
            displayMessage(errorData.message || "Erro ao processar o palpite.", "error");
            inputJogo.disabled = false; // Reabilita em caso de erro de validação (não fim de jogo)
            document.querySelector('.game button').disabled = false;
            return;
        }

        if (!response.ok) {
            throw new Error(`Erro HTTP! status: ${response.status}`);
        }

        const result = await response.json(); // AttemptResultDTO do backend

        let newGuessItem = document.createElement("li");
        newGuessItem.textContent = guess;

        if (result.isCorrect) {
            displayMessage(`Parabéns! Você acertou: ${result.challengeAnswer}!`, "success");
            newGuessItem.classList.add('correct-guess');
            // Ao acertar, exibe a ÚLTIMA imagem disponível (índice final)
            imagemElement.src = `http://localhost:8080/image/proxy?url=${encodeURIComponent(currentChallenge.frames[currentChallenge.frames.length - 1])}`;
            inputJogo.disabled = true;
            document.querySelector('.game button').disabled = true;
            // Quando acerta, todos os botões de frame devem ser mostrados
            renderFrameButtons(currentChallenge.frames.length);
        } else {
            displayMessage("Você errou. Tente novamente!", "error");
            newGuessItem.classList.add('incorrect-guess');

            // Lógica para mostrar o PRÓXIMO frame após um erro:
            // `result.order` é a ordem da tentativa atual (0-indexed).
            // A próxima imagem a ser mostrada será `currentChallenge.frames[result.order + 1]`.
            // Ex: Se `order` é 0 (primeira tentativa errada), mostra `frames[1]`.
            const nextFrameIndexToShow = result.order + 1;
            const actualFrameToShow = Math.min(nextFrameIndexToShow, currentChallenge.frames.length - 1); // Garante que não excede o array

            imagemElement.src = `http://localhost:8080/image/proxy?url=${encodeURIComponent(currentChallenge.frames[actualFrameToShow])}`;
            remainingGuessesElement.textContent = `Tentativas restantes: ${result.remainingGuesses}`;

            // O número de botões a serem renderizados é (número de tentativas feitas) + 1 (o frame que acaba de ser revelado)
            // `result.order` é o índice da tentativa, então `result.order + 1` é o número de tentativas feitas.
            // Para o Framed, o botão `N` é revelado quando a imagem `N` (índice N-1) é mostrada.
            // O `result.order` é o índice da tentativa feita (0 para a 1ª, 1 para a 2ª...).
            // O número de frames revelados será `result.order + 1 + 1` para a próxima imagem.
            // Ou de forma mais simples: total de tentativas feitas (result.order + 1) + 1 (o novo frame).
            const framesToRenderButtons = (result.order + 1) + 1;
            renderFrameButtons(framesToRenderButtons);


            if (result.remainingGuesses === 0 && !result.isCorrect) {
                displayMessage(`Suas tentativas acabaram! O desenho era: ${result.challengeAnswer}`, "error");
                inputJogo.disabled = true;
                document.querySelector('.game button').disabled = true;
                // Ao final das tentativas, exibe o último frame (revelando a resposta completa)
                imagemElement.src = `http://localhost:8080/image/proxy?url=${encodeURIComponent(currentChallenge.frames[currentChallenge.frames.length - 1])}`;
                // E todos os botões de frame devem ser mostrados
                renderFrameButtons(currentChallenge.frames.length);
            } else {
                inputJogo.disabled = false;
                document.querySelector('.game button').disabled = false;
            }
        }

        listaJogos.prepend(newGuessItem); // Adiciona novo palpite no topo da lista
        inputJogo.value = "";
        updateGameState(result.remainingGuesses, result.isCorrect);

    } catch (error) {
        console.error("Erro ao enviar palpite:", error);
        displayMessage("Ocorreu um erro ao processar seu palpite.", "error");
        inputJogo.disabled = false;
        document.querySelector('.game button').disabled = false;
    }
}

/**
 * Renderiza os botões de navegação dos frames.
 * @param {number} numFramesToRender O número total de frames para os quais botões devem ser criados (começando de 1).
 */
function renderFrameButtons(numFramesToRender) {
    frameNavigation.innerHTML = ''; // Limpa botões existentes
    // Garante que não criamos mais botões do que frames disponíveis
    const actualNumButtons = Math.min(numFramesToRender, currentChallenge.frames.length);

    for (let i = 0; i < actualNumButtons; i++) {
        const button = document.createElement('button');
        button.textContent = i + 1; // Texto do botão (1, 2, 3...)
        // Associa o clique do botão à função que mostra o frame correspondente
        button.onclick = () => showSpecificFrame(i);
        frameNavigation.appendChild(button);
    }
}

/**
 * Exibe um frame específico do desafio com base no índice.
 * @param {number} frameIndex O índice (0-based) do frame a ser exibido do array `currentChallenge.frames`.
 */
function showSpecificFrame(frameIndex) {
    if (currentChallenge && currentChallenge.frames && currentChallenge.frames[frameIndex]) {
        // Usa o proxy de imagem para carregar imagens de Imgur, etc.
        imagemElement.src = `http://localhost:8080/image/proxy?url=${encodeURIComponent(currentChallenge.frames[frameIndex])}`;
    }
}

function renderPreviousGuesses(guesses = []) {
    // Esta função foi mantida, mas não é usada para carregar palpites persistidos do backend
    // porque o ChallengeDTO atual não os inclui.
    // Ela só será chamada com os palpites recebidos no AttemptResultDTO ou com um array vazio na carga inicial.
    // O submitGuess já adiciona o novo palpite via prepend.
}

function updateGameState(remainingGuesses, isCorrect) {
    const isGameOver = isCorrect || remainingGuesses <= 0;
    inputJogo.disabled = isGameOver;
    document.querySelector('.game button').disabled = isGameOver;
}

/**
 * Exibe uma mensagem ao usuário com um tipo específico (para estilização).
 * @param {string} text - O texto da mensagem.
 * @param {string} type - O tipo da mensagem ('success', 'error', 'info').
 * @param {HTMLElement} [element=mensagem] - O elemento DOM onde a mensagem será exibida. Padrão é 'mensagem'.
 */
function displayMessage(text, type, element = mensagem) {
    element.textContent = text;
    element.className = `message ${type}`;
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
        const response = await fetch(`${API_BASE_URL}/challenge/ranking/weekly`, {
            headers: getHeadersForRoute(`${API_BASE_URL}/challenge/ranking/weekly`)
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

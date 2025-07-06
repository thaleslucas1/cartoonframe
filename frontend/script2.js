const API_BASE_URL = 'http://localhost:8080/api'; 
const AUTH_BASE_URL = 'http://localhost:8080/auth';
const PASSWORD_RESET_BASE_URL = 'http://localhost:8080/password-reset'; 

const sendButton = document.querySelector('.game button');
let currentChallenge = null;
let userToken = localStorage.getItem('jwtToken');
let loggedInUser = null;
let currentResetEmail = null;

let sessionId = localStorage.getItem('sessionId'); 

function getSessionId() {
    let stored = localStorage.getItem('sessionId');
    if (!stored) {
        stored = generateUuidv4();
        localStorage.setItem('sessionId', stored);
    }
    return stored;
}

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

const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const resetCodeModal = document.getElementById('resetCodeModal');
const newPasswordModal = document.getElementById('newPasswordModal');
const userProfileModal = document.getElementById('userProfileModal'); 
const adminPageModal = document.getElementById('adminPage'); 

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const resetCodeForm = document.getElementById('resetCodeForm');
const newPasswordForm = document.getElementById('newPasswordForm');

const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');
const forgotMessage = document.getElementById('forgotMessage');
const resetCodeMessage = document.getElementById('resetCodeMessage');
const newPasswordMessage = document.getElementById('newPasswordMessage');

const profileNameElement = document.getElementById('profileName');
const profileEmailElement = document.getElementById('profileEmail');
const profileNicknameElement = document.getElementById('profileNickname');
const profileScoreElement = document.getElementById('profileScore');
const pastChallengesContainer = document.getElementById('pastChallengesContainer');
const pastChallengesList = document.getElementById('pastChallengesList');


function generateUuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Função para formatar a data ignorando o timezone,
 * retornando a data no formato DD/MM/YYYY exatamente da string ISO recebida
 */
function formatDateWithoutTimezone(dateString) {
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Função que retorna os headers adequados para a requisição.
 * Prioriza o JWT se o usuário estiver logado, caso contrário, envia o Session ID
 * para rotas onde o backend precisa rastrear usuários anônimos.
 * @param {string} fullRoute - A rota completa que está sendo chamada.
 * @param {boolean} isJson - Indica se o Content-Type deve ser 'application/json'.
 * @returns {Object} Headers para a requisição.
 */
function getHeadersForRoute(fullRoute, isJson = false) {
    let headers = {};

    if (isJson) {
        headers['Content-Type'] = 'application/json';
    }

    if (userToken && userToken !== 'null' && userToken !== 'undefined') {
        headers['Authorization'] = `Bearer ${userToken}`;
    } else {
        if (sessionId) {
            headers['X-Session-ID'] = sessionId;
        }
    }
    return headers;
}

document.addEventListener('DOMContentLoaded', () => {
    if (!sessionId) {
        sessionId = generateUuidv4();
        localStorage.setItem('sessionId', sessionId);
        console.log("Novo Session ID gerado e guardado:", sessionId);
    } else {
        console.log("Session ID existente:", sessionId);
    }

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
                localStorage.setItem('userRole', loggedInUser.role); 
                loggedInUser.role = loggedInUser.role; 
                displayUserProfile(loggedInUser.name || loggedInUser.nickname || loggedInUser.email);
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

function displayUserProfile(nickname) {
    let profileHtml = `<span>${nickname}</span> <button onclick="showUserProfileModal()">Perfil</button>`;

    if (loggedInUser && loggedInUser.role === 'A') { 
        profileHtml += ` <button onclick="showAdminPage()">Página do Admin</button>`;
    }
    userProfileDiv.innerHTML = profileHtml;
}

function displayLoginButton() {
    userProfileDiv.innerHTML = `<button onclick="showLogin()">Login</button>`;
}

function clearUserSession() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole'); 
    userToken = null;
    loggedInUser = null;

    sessionId = getSessionId(); 
    displayLoginButton();
}

async function login(identifier, password) {
    try {
        const response = await fetch(`${AUTH_BASE_URL}/login`, {
            method: 'POST',
            headers: getHeadersForRoute(`${AUTH_BASE_URL}/login`, true),
            body: JSON.stringify({ identifier, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('jwtToken', data.token);
            localStorage.setItem('userRole', data.role); 
            userToken = data.token;
            if (data.sessionId) {
                localStorage.setItem('sessionId', data.sessionId);
                sessionId = data.sessionId;
            } else {
                sessionId = localStorage.getItem('sessionId') || generateUuidv4();
                localStorage.setItem('sessionId', sessionId);
            }
            await checkUserLoginStatus();
            await fetchDailyChallenge();
            closeModal();
            displayMessage('', 'info');

            location.reload();
        } else {
            displayMessage(data.message || "Credenciais inválidas. Verifique seu email/nickname e senha.", "error", loginMessage);
        }
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        displayMessage("Erro ao conectar com o servidor. Tente novamente mais tarde.", "error", loginMessage);
    }
}

async function register(name, nickname, email, password) {
    try {
        const response = await fetch(`${AUTH_BASE_URL}/register`, {
            method: 'POST',
            headers: getHeadersForRoute(`${AUTH_BASE_URL}/register`, true),
            body: JSON.stringify({ name, nickname, email, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('jwtToken', data.token); 
            localStorage.setItem('userRole', data.role); 
            userToken = data.token;
            if (data.sessionId) {
                localStorage.setItem('sessionId', data.sessionId);
                sessionId = data.sessionId;
            } else {
                localStorage.removeItem('sessionId');
                sessionId = null;
            }
            await checkUserLoginStatus();
            await fetchDailyChallenge();
            closeModal();
            displayMessage('', 'info', registerMessage);

            location.reload();
        } else {
            displayMessage(data.message || "Erro ao registrar usuário. Tente outro email ou nickname.", "error", registerMessage);
        }
    } catch (error) {
        console.error("Erro ao registrar:", error);
        displayMessage("Erro ao conectar com o servidor. Tente novamente mais tarde.", "error", registerMessage);
    }
}

async function requestPasswordResetCode(email) {
    try {
        const response = await fetch(`${PASSWORD_RESET_BASE_URL}/request-code`, {
            method: 'POST',
            headers: getHeadersForRoute(`${PASSWORD_RESET_BASE_URL}/request-code`, true),
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (response.ok) {
            currentResetEmail = email;
            displayMessage(data.message || "Código de redefinição enviado para seu email.", "success", forgotMessage);
            setTimeout(showResetCodeForm, 1500);
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
            setTimeout(showNewPasswordForm, 1500);
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
            currentResetEmail = null;
            setTimeout(showLogin, 2000);
        } else {
            displayMessage(data.message || "Erro ao redefinir senha.", "error", newPasswordMessage);
        }
    } catch (error) {
        console.error("Erro ao redefinir senha:", error);
        displayMessage("Erro ao conectar com o servidor.", "error", newPasswordMessage);
    }
}

function showLogin() {
    loginModal.style.display = 'flex';
    registerModal.style.display = 'none';
    forgotPasswordModal.style.display = 'none';
    resetCodeModal.style.display = 'none';
    newPasswordModal.style.display = 'none';
    userProfileModal.style.display = 'none'; 
    adminPageModal.style.display = 'none'; 
    loginMessage.textContent = '';
    loginForm.reset();
}

function showRegister() {
    registerModal.style.display = 'flex';
    loginModal.style.display = 'none';
    forgotPasswordModal.style.display = 'none';
    resetCodeModal.style.display = 'none';
    newPasswordModal.style.display = 'none';
    userProfileModal.style.display = 'none'; 
    adminPageModal.style.display = 'none'; 
    registerMessage.textContent = '';
    registerForm.reset();
}

function showForgotPassword() {
    forgotPasswordModal.style.display = 'flex';
    loginModal.style.display = 'none';
    registerModal.style.display = 'none';
    resetCodeModal.style.display = 'none';
    newPasswordModal.style.display = 'none';
    userProfileModal.style.display = 'none'; 
    adminPageModal.style.display = 'none'; 
    forgotMessage.textContent = '';
    forgotPasswordForm.reset();
}

function showResetCodeForm() {
    resetCodeModal.style.display = 'flex';
    forgotPasswordModal.style.display = 'none';
    loginModal.style.display = 'none';
    newPasswordModal.style.display = 'none';
    userProfileModal.style.display = 'none'; 
    adminPageModal.style.display = 'none'; 
    resetCodeMessage.textContent = '';
    resetCodeForm.reset();
}

function showNewPasswordForm() {
    newPasswordModal.style.display = 'flex';
    resetCodeModal.style.display = 'none';
    loginModal.style.display = 'none';
    userProfileModal.style.display = 'none'; 
    adminPageModal.style.display = 'none'; 
    newPasswordMessage.textContent = '';
    newPasswordForm.reset();
}

function showUserProfileModal() {
    if (!loggedInUser) {
        console.error("Usuário não logado para exibir o perfil.");
        return;
    }
    profileNameElement.textContent = loggedInUser.name;
    profileEmailElement.textContent = loggedInUser.email;
    profileNicknameElement.textContent = loggedInUser.nickname;
    profileScoreElement.textContent = loggedInUser.score;

    loginModal.style.display = 'none';
    registerModal.style.display = 'none';
    forgotPasswordModal.style.display = 'none';
    resetCodeModal.style.display = 'none';
    newPasswordModal.style.display = 'none';
    adminPageModal.style.display = 'none'; 
    userProfileModal.style.display = 'flex'; 

    pastChallengesContainer.style.display = 'none'; 
    pastChallengesList.innerHTML = ''; 
}

function showAdminPage() {
    if (!loggedInUser || loggedInUser.role !== 'A') {
        alert("Acesso negado. Esta página é apenas para administradores.");
        return;
    }
    loginModal.style.display = 'none';
    registerModal.style.display = 'none';
    forgotPasswordModal.style.display = 'none';
    resetCodeModal.style.display = 'none';
    newPasswordModal.style.display = 'none';
    userProfileModal.style.display = 'none';
    adminPageModal.style.display = 'flex'; 
    createChallengeMessage.textContent = ''; 
    createChallengeForm.reset(); 
}


function closeModal() {
    loginModal.style.display = 'none';
    registerModal.style.display = 'none';
    forgotPasswordModal.style.display = 'none';
    resetCodeModal.style.display = 'none';
    newPasswordModal.style.display = 'none';
    userProfileModal.style.display = 'none'; 
    adminPageModal.style.display = 'none'; 
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const identifier = document.getElementById('loginIdentifier').value;
    const password = document.getElementById('loginPassword').value;
    login(identifier, password);
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const nickname = document.getElementById('registerNickname').value;
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

createChallengeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const imageUrlsInput = document.getElementById('challengeImageUrls').value;
    const correctAnswer = document.getElementById('challengeCorrectAnswer').value;
    const releaseDate = document.getElementById('challengeReleaseDate').value;

    const imageUrls = imageUrlsInput.split(',').map(url => url.trim()).filter(url => url !== '');

    if (!userToken || loggedInUser.role !== 'A') {
        displayMessage("Erro: Você não tem permissão para criar desafios.", "error", createChallengeMessage);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/challenges`, {
            method: 'POST',
            headers: getHeadersForRoute(`${API_BASE_URL}/admin/challenges`, true),
            body: JSON.stringify({
                imageUrls: imageUrls,
                correctAnswer: correctAnswer,
                releaseDate: releaseDate
            })
        });

        const data = await response.json();
        if (response.ok) {
            displayMessage("Desafio criado com sucesso!", "success", createChallengeMessage);
            createChallengeForm.reset();
        } else {
            displayMessage(data.message || "Erro ao criar desafio. Verifique os dados.", "error", createChallengeMessage);
        }
    } catch (error) {
        console.error("Erro ao criar desafio:", error);
        displayMessage("Erro ao conectar com o servidor. Tente novamente mais tarde.", "error", createChallengeMessage);
    }
});

async function fetchDailyChallenge() {
    try {
        const response = await fetch(`${API_BASE_URL}/challenge/today`, {
            headers: getHeadersForRoute(`${API_BASE_URL}/challenge/today`)
        });

        if (!response.ok) throw new Error(`Erro HTTP! status: ${response.status}`);

        const challenge = await response.json();
        renderChallenge(challenge);

    } catch (error) {
        console.error("Erro ao buscar o desafio diário:", error);
        displayMessage("Não foi possível carregar o desafio de hoje. Tente novamente mais tarde.", "error");
        inputJogo.disabled = true;
        document.querySelector('.game button').disabled = true;
    }
}

function renderChallenge(challenge) {
    currentChallenge = challenge;

    challengeDateElement.textContent = `Desafio de ${formatDateWithoutTimezone(challenge.date)}`;

    const lastFrameIndex = challenge.frames.length - 1;
    imagemElement.src = challenge.frames[lastFrameIndex];

    remainingGuessesElement.textContent = `Tentativas restantes: ${challenge.remainingGuesses}`;
    if (challenge.isCompleted || challenge.remainingGuesses === 0) {
        displayMessage(`O desafio terminou! Resposta: ${challenge.challengeAnswer}`, "info");
        inputJogo.disabled = true;
        sendButton.disabled = true;
    } else {
        displayMessage('', 'info');
        inputJogo.disabled = false;
        sendButton.disabled = false;
    }

    renderFrameButtons(challenge.frames.length);
    listaJogos.innerHTML = '';
}


async function fetchChallengeByDate(date) {
    try {
        const response = await fetch(`${API_BASE_URL}/challenge/by-date/${date}`, {
            headers: getHeadersForRoute(`${API_BASE_URL}/challenge/by-date/${date}`)
        });

        if (!response.ok) throw new Error(`Erro HTTP! status: ${response.status}`);

        const challenge = await response.json();
        renderChallenge(challenge);

    } catch (error) {
        console.error("Erro ao buscar desafio por data:", error);
        displayMessage("Erro ao carregar o desafio selecionado.", "error");
    }
}


async function submitGuess() {
    console.log("[IMAGEM LOG] Início de submitGuess.");
    const guess = inputJogo.value.trim();
    if (guess === "") {
        displayMessage("Por favor, digite um palpite!", "error");
        return;
    }

    if (!currentChallenge || currentChallenge.id === undefined || currentChallenge.id === null) {
        displayMessage("Erro: Desafio não carregado corretamente (ID ausente). Tente recarregar a página.", "error");
        console.error("currentChallenge.id é undefined ou null. Objeto currentChallenge:", currentChallenge);
        return;
    }

    inputJogo.disabled = true;
    document.querySelector('.game button').disabled = true;

    try {
        const requestHeaders = getHeadersForRoute(`${API_BASE_URL}/challenge/try`, true);
        console.log("[IMAGEM LOG] Headers para /challenge/try:", requestHeaders);

        const response = await fetch(`${API_BASE_URL}/challenge/try`, {
            method: 'POST',
            headers: requestHeaders,
            body: JSON.stringify({
                guess: guess,
                challengeId: currentChallenge.id 
            })
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
        console.log("[IMAGEM LOG] Resultado da tentativa (result):", result);

        currentChallenge.frames = result.frames;
        console.log("[IMAGEM LOG] currentChallenge.frames atualizado:", currentChallenge.frames);

        let newGuessItem = document.createElement("li");
        newGuessItem.textContent = guess;

        if (result.isCorrect) {
            displayMessage(`Parabéns! Você acertou: ${result.challengeAnswer}!`, "success");
            newGuessItem.classList.add('correct-guess');
            imagemElement.src = result.currentFrame;
            inputJogo.disabled = true;
            document.querySelector('.game button').disabled = true;
        } else {
            if (result.remainingGuesses === 0) {
                displayMessage(`Fim do desafio! A resposta era: ${result.challengeAnswer}`, "info");
                inputJogo.disabled = true;
                document.querySelector('.game button').disabled = true;
            } else {
                displayMessage(`Errado! Tente novamente.`, "error");
                inputJogo.disabled = false;
                document.querySelector('.game button').disabled = false;
            }
            imagemElement.src = currentChallenge.frames[currentChallenge.frames.length - 1];
        }

        listaJogos.appendChild(newGuessItem);
        remainingGuessesElement.textContent = `Tentativas restantes: ${result.remainingGuesses}`;

        renderFrameButtons(currentChallenge.frames.length);
        inputJogo.value = '';

        if (loggedInUser && result.user && result.user.score !== undefined) {
            loggedInUser.score = result.user.score;
            profileScoreElement.textContent = loggedInUser.score;
        }

    } catch (error) {
        console.error("Erro ao enviar palpite:", error);
        displayMessage("Erro ao conectar com o servidor. Tente novamente mais tarde.", "error");
        inputJogo.disabled = false;
        document.querySelector('.game button').disabled = false;
    }
}

function renderFrameButtons(totalFrames) {
    frameNavigation.innerHTML = '';
    for (let i = 0; i < totalFrames; i++) {
        let button = document.createElement('button');
        button.textContent = `${i + 1}`;
        button.addEventListener('click', () => {
            imagemElement.src = currentChallenge.frames[i];
        });
        frameNavigation.appendChild(button);
    }
}

function handleInputChange() {
    const input = inputJogo.value.toLowerCase();
    suggestionsDatalist.innerHTML = '';

    if (currentChallenge && currentChallenge.suggestions) {
        currentChallenge.suggestions.forEach(suggestion => {
            if (suggestion.toLowerCase().startsWith(input) && input.length > 0) {
                const option = document.createElement('option');
                option.value = suggestion;
                suggestionsDatalist.appendChild(option);
            }
        });
    }
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
            headers: getHeadersForRoute(`${API_BASE_URL}/ranking/weekly`)
        });
        if (!response.ok) throw new Error(`Erro HTTP! status: ${response.status}`);

        const ranking = await response.json();
        rankingListElement.innerHTML = '';

        ranking.forEach((user, index) => {
            const li = document.createElement('li'); 
            li.textContent = `${index + 1}. ${user.nickname} - Pontos: ${user.points}`;
            rankingListElement.appendChild(li);
        });
    } catch (error) {
        console.error("Erro ao buscar ranking semanal:", error);
    }
}

function logout() {
    clearUserSession();
    location.reload();
}

function displayMessage(text, type = 'info', container = mensagem) {
    container.textContent = text;
    container.className = type; 
}

async function showPastChallenges() {
    pastChallengesContainer.style.display = 'block'; 
    pastChallengesList.innerHTML = '<li>Carregando desafios anteriores...</li>'; 

    try {
        const response = await fetch(`${API_BASE_URL}/challenge/history`, {
            headers: getHeadersForRoute(`${API_BASE_URL}/challenge/history`)
        });

        if (!response.ok) {
            throw new Error(`Erro ao buscar histórico de desafios: ${response.status}`);
        }

        const pastChallenges = await response.json();
        pastChallengesList.innerHTML = ''; 

        if (pastChallenges.length === 0) {
            pastChallengesList.innerHTML = '<li>Nenhum desafio anterior encontrado.</li>';
            return;
        }

        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const formattedDate = date.toISOString().split('T')[0]; 

            const challengeForDay = pastChallenges.find(pc => pc.date === formattedDate);

            const li = document.createElement('li');
            const dateSpan = document.createElement('span');
            dateSpan.textContent = formatDateWithoutTimezone(formattedDate);
            li.appendChild(dateSpan);

        if (challengeForDay) {
            const statusSpan = document.createElement('span');
            const completedSuccessfully = challengeForDay.isCompleted; 
            const allGuessesUsed = challengeForDay.remainingGuesses === 0; 

            if (completedSuccessfully) {
                statusSpan.textContent = `Status: Concluído: Você Acertou!`;
                statusSpan.style.color = 'lightgreen';
            } else if (allGuessesUsed) { 
                statusSpan.textContent = 'Status: Desafio Concluído: Você Errou'; 
                statusSpan.style.color = 'salmon'; 
            } else {
                statusSpan.textContent = 'Status: Não Concluído';
                statusSpan.style.color = 'orange';
            }
            li.appendChild(statusSpan);

            const viewButton = document.createElement('button');
            viewButton.textContent = 'Ver Desafio';
            viewButton.onclick = () => {
                fetchChallengeByDate(formattedDate);
                closeModal();
            };
            li.appendChild(viewButton);
        } else {
            const statusSpan = document.createElement('span');
            statusSpan.textContent = 'Status: N/A';
            statusSpan.style.color = 'gray';
            li.appendChild(statusSpan);
        }

            pastChallengesList.appendChild(li);
        }

    } catch (error) {
        console.error("Erro ao carregar desafios anteriores:", error);
        pastChallengesList.innerHTML = '<li>Erro ao carregar desafios anteriores.</li>';
    }
}

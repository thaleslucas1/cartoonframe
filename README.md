# 📺 CartoonFrame

![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.0-brightgreen?style=flat-square&logo=springboot)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

O **CartoonFrame** é um jogo diário de adivinhação focado na nostalgia dos desenhos animados que marcaram a TV brasileira. Inspirado na dinâmicas do *Framed*, o objetivo é descobrir qual é o desenho do dia utilizando o menor número de frames possível.

---

## ✨ Funcionalidades

- **Desafio Diário:** Um novo desafio é gerado todos os dias. Os jogadores têm até 5 tentativas para adivinhar o desenho com base em frames progressivos.
- **Jogabilidade Flexível:** Suporte para usuários logados (acumulando pontos no ranking) e jogadores anônimos (via controle de sessão no navegador).
- **Ranking Semanal:** Um placar dinâmico que destaca os melhores jogadores da semana com base na precisão e rapidez dos acertos.
- **Sistema de Autenticação:** Cadastro completo com verificação de e-mail via UUID e fluxo seguro de recuperação de senha.
- **Painel Administrativo:** Área restrita para administradores cadastrarem os próximos desafios (URL das imagens, resposta e data de lançamento).
- **Histórico de Jogos:** Usuários cadastrados podem revisar seu desempenho nos últimos 7 dias.

---

## 🛠 Tecnologias Utilizadas

**Frontend:**
- React 18
- Context API (Gerenciamento de Estado e Modais)
- Fetch API
- CSS Puro (Design responsivo e variáveis dinâmicas)

**Backend:**
- Java 21
- Spring Boot 3.5.0
- Spring Security & JWT (JSON Web Tokens)
- Spring Data JPA
- PostgreSQL
- Spring Mail (Integração SMTP para e-mails)

---

## 📁 Estrutura do Projeto

```
cartoonframe/
├── backend/
│   ├── src/main/java/com/cartoonframe/app/
│   │   ├── controller/        # Endpoints REST (Auth, Challenge, Ranking, etc.)
│   │   ├── dto/               # Objetos de transferência de dados (Records)
│   │   ├── infra/
│   │   │   ├── exception/     # Tratamento global de erros
│   │   │   └── security/      # Filtros JWT, TokenService, CustomUserDetailsService
│   │   ├── model/             # Entidades JPA e Enums
│   │   ├── repository/        # Interfaces Spring Data JPA
│   │   ├── service/           # Lógica de negócio e regras do jogo
│   │   └── util/              # Utilitários de validação
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── api/               # Chamadas Fetch para o backend
│   │   ├── components/
│   │   │   ├── game/          # Lógica principal do jogo (Game.jsx)
│   │   │   ├── layout/        # Componentes estruturais (Header, RankingSidebar)
│   │   │   └── modals/        # Modais (Login, Admin, Profile, etc.)
│   │   ├── context/           # Estados globais (AuthContext, ModalContext)
│   │   ├── App.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos

- [Java 21](https://adoptium.net/)
- [Node.js v18+](https://nodejs.org/) e npm
- [PostgreSQL](https://www.postgresql.org/) rodando localmente

---

### 1. Clonando o repositório

```bash
git clone https://github.com/seu-usuario/cartoonframe.git
cd cartoonframe
```

---

### 2. Configurando o Backend

Navegue até a pasta do backend e crie o arquivo `.env` com base no `.env.example`:

```bash
cd backend
cp .env.example .env
```

Preencha as variáveis no arquivo `.env` com os seus dados locais (veja a seção de [Variáveis de Ambiente](#-variáveis-de-ambiente)).

Em seguida, execute o projeto com Maven:

```bash
./mvnw spring-boot:run
```

O backend estará disponível em `http://localhost:8080`.

---

### 3. Configurando o Frontend

Em outro terminal, navegue até a pasta do frontend e instale as dependências:

```bash
cd frontend
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

---

## 🔐 Variáveis de Ambiente

As variáveis de ambiente do backend ficam no arquivo `backend/.env`. Crie-o a partir do `backend/.env.example`.

| Variável | Descrição | Exemplo |
|---|---|---|
| `DATASOURCE_URL` | URL de conexão com o banco PostgreSQL | `jdbc:postgresql://localhost:5432/cartoonframe` |
| `DATASOURCE_USERNAME` | Usuário do banco de dados | `postgres` |
| `DATASOURCE_PASSWORD` | Senha do banco de dados | `sua_senha` |
| `SECURITY_TOKEN_SECRET` | Chave secreta para assinatura dos tokens JWT | `minha-chave-super-secreta` |
| `SPRING_MAIL_EMAIL` | E-mail utilizado para envio de mensagens | `seu@gmail.com` |
| `SPRING_MAIL_PASSWORD` | Senha de app do Gmail (não a senha da conta) | `xxxx xxxx xxxx xxxx` |
| `CORS_ALLOWED_ORIGINS` | URL do frontend permitida pelo CORS | `http://localhost:5173` |

> **Atenção:** Nunca suba o arquivo `.env` para o repositório. Ele já está listado no `.gitignore` do backend.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/minha-feature`)
3. Faça o commit das suas alterações (`git commit -m 'feat: adiciona minha feature'`)
4. Faça o push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
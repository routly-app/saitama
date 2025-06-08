# 📜 Saitama

Saitama is an open source payment infastructure that enables developers to receive crypto payments without requiring users to connect their wallets. It's fast, gasless for users, and designed for seamless integration into web apps, APIs, and platforms.

Looking for sandboxed wallet integrations?

If you're looking for our sanboxed wallet connect plugin for Telegram mini Apps, bots, or embeded experiences [visit](docs.saitama.fun/wallets)

## 🚀 Overview

Saitama lets you accept payments by generating temporary, user-friendly payment endpoints that abstract away blockchain complexity, no wallet popups, no browser extensions. Perfect for onboarding non-crypto users.

### 🎯 Features 

- [x] No wallet connection required.
- [x] Open source and self hostable.
- [x] Works primarily with Solana, Ethereum and add plugin support for EVM chains (e.g Polygon, BSC).
- [x] Supports SOL, ETH, USDC, USDT, or custom SPL-Tokens and ERC-20 tokens. 
- [x] Secure metadata based payment validation.
- [x] Optional webhook callbacks.
- [x] Developer friendly API.

### 🔧 Installation 

1. Clone the Repository 
```shell
git clone https://github.com/saitama/saitama.git && cd saitama
```

2. Install Dependencies 
```shell
bun install
```
3. Set up Environment 
i. cd to `servers/api` path, create a .env file and fill in your secrets,
```bash
#.env
APP_HOST=8000
APP_PORT=127.0.0.1
APP_MNEMONIC=''
APP_SECRET_KEY=''
APP_TRON_RPC_URL='http://127.0.0.1:8899'
APP_SOLANA_RPC_URL='http://127.0.0.1:8899'
APP_ETHEREUM_RPC_URL='http://127.0.0.1:8545'
APP_DATABASE_URL='postgres://localhost/saitama'
APP_FIREBASE_SERVICE_ACCOUNT=''
```

>To generate a APP_SECRET_KEY use `openssl rand -hex 32`

ii. cd to web/payment path, create a .env file and fill in your secrets
```bash
NEXT_PUBLIC_APP_ID=''
NEXT_PUBLIC_API_KEY=''
NEXT_PUBLIC_SECRET_API_KEY=
NEXT_PUBLIC_API_BASE_URL='http://127.0.0.1:8000'
```
>To generate an app id and api key and secret check [docs](https://docs.saitama.fun)


### 🧪 Development 
Start development server 

```bash
bun dev
# visit http://127.0.0.1:8000 to access api endpoints
# visit http://localhost:3000 to access payment app
```


[![Postman Logo](https://www.vectorlogo.zone/logos/getpostman/getpostman-ar21.svg)](https://postman.co/workspace/dev~9927637c-4820-4663-8761-3d6ba542bf3b/collection/18547775-28a5341c-fe5a-450c-b77e-c993e36cafc1?action=share&creator=18547775)





### 🧑🏽‍💻 Contributing
We welcome PRs and issue reports!

```bash
git checkout -b feature/your-feature
bun test
```

### ❤️ Usages
Projects that uses [saitama.fun](https://saitama.fun) for accepting crypto payments.

### ⚖️ License 
Licensed under [AGPL](https://www.gnu.org/licenses/agpl-3.0.html)
# Trinity

🇬🇧 English | [🇷🇺 Русский](README.ru.md)

Telegram WebApp application launched via **[@TrinitySpaceBot](https://t.me/TrinitySpaceBot)**.

The project is a financial Telegram WebApp platform with an administrative management panel.  
The application is running in production and serves **40,000+ users**.

Development team:
- 1 Backend Developer
- 1 Frontend Developer (WebApp + Admin Panel)

---

## 📦 Project Structure

The project is built as an **NX Monorepo** and includes:

```text
apps/
  web/        → Telegram WebApp
  api/        → Backend (REST API)
  admin/      → Administrative Panel

libs/
  shared/     → Shared utilities and modules
  ui/         → UI components
  api/        → RTK Query services
```

Two environments are supported:

- **test** — testing environment (separate database)
- **production** — production environment (separate database)

---

## 🚀 Running the Project

### 1. Install dependencies

```bash
npm install
```

### 2. Run the entire application (Frontend + Backend)

```bash
npx nx run-many --target=serve --all
```

### 3. Run Backend only

```bash
npx nx run backend:serve
```

### 4. Run Frontend only

```bash
npx nx run frontend:serve
```

After запуск services will be available at the local addresses defined in the NX configuration.

---

## 🔐 Local Authorization (Development)

For local authorization testing, Telegram parameters must be manually passed in the URL.

Open the application:

```
http://localhost:4203/?tgId=YOUR_ID&username=YOUR_USERNAME
```

Example:

```
http://localhost:4203/?tgId=123456789&username=ivan_tg
```

### ⚙️ How It Works

- If a user with the provided `tgId` does not exist in the database, a new user will be automatically created.
- You will be prompted to **enter a PIN code twice** for confirmation.
- After successful PIN creation, the user will be automatically authenticated.

### ⏳ PIN Expiration

- The PIN code is valid for **3 hours**.
- After expiration, re-authentication is required.

---

## 🧩 Core WebApp Features

- Telegram-based authentication
- PIN-based account protection
- Balance overview
- Deposit address generation
- Withdrawals
- Internal user-to-user transfers
- Transaction history
- Profile management
- Subscription management
- Advanced referral system
- Notifications
- Error and operation status handling
- Lessons in video / audio / text formats

---

## 🛠 Admin Panel Features

- User management
- Transaction monitoring and management
- Balance control
- User blocking / unblocking
- Subscription management
- Statistics dashboard
- Data moderation
- Lesson / training creation

---

## ⚙️ Tech Stack

### Frontend
- React
- TypeScript
- Redux Toolkit
- RTK Query
- SCSS
- Telegram WebApp SDK

### Backend
- Node.js
- REST API
- JWT
- MongoDB

### Infrastructure
- NX Monorepo
- Separate test / production environments
- Separate databases per environment

---

## 📊 Project Scale

- 40,000+ active users
- Production-ready architecture
- Real-time financial operations
- Environment isolation (test / production)

---

## 🔐 Security

- Telegram-based authentication
- JWT tokens
- PIN-based account protection
- Role-based access control (User / Admin)
- Environment isolation

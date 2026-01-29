# CapMobilité - Wheelchair Platform

CapMobilité is a comprehensive digital platform designed for the distribution and management of wheelchairs reimbursed by the French Health Insurance (since the December 2025 reform). It streamlines the administrative process for patients, provides specialized tools for administrators, and offers a secure portal for medical prescribers.

## 🚀 Getting Started

This repository contains both the frontend and backend of the application.

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Docker & Docker Compose**: For database and infrastructure services

---

### 🔧 Backend Setup (NestJS)

The backend is built with NestJS, Prisma, and PostgreSQL.

1.  **Navigate to backend folder**:
    ```bash
    cd backend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Copy `.env.example` to `.env` and adjust the variables if needed.
    ```bash
    cp .env.example .env
    ```

4.  **Start Infrastructure Services** (PostgreSQL, Redis, LocalStack):
    ```bash
    npm run docker:up
    ```

5.  **Run Database Migrations**:
    ```bash
    npm run prisma:migrate:dev
    ```

6.  **Start the API in development mode**:
    ```bash
    npm run start:dev
    ```
    The API will be available at `http://localhost:4000`.

---

### 💻 Frontend Setup (Next.js)

The frontend is built with Next.js 15+, Tailwind CSS, and shadcn/ui.

1.  **Navigate to frontend folder**:
    ```bash
    cd frontend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the development server**:
    ```bash
    npm run dev
    ```
    Open `http://localhost:3000` in your browser.

---

## 🏗️ Project Architecture

### Frontend (`/frontend`)
- **Next.js App Router**: Using `[locale]` for internationalization (FR/EN).
- **Zustand**: For client-side state management (Auth, UI).
- **React Query**: For server state and API synchronization.
- **shadcn/ui**: High-quality reusable components.
- **MSW (Mock Service Worker)**: For frontend development without a running backend.

### Backend (`/backend`)
- **NestJS**: Modular architecture.
- **Prisma**: ORM for PostgreSQL.
- **Redlock**: Distributed locking for critical operations.
- **BullMQ**: Queue management for background jobs (emails, document processing).
- **LocalStack**: Emulating S3 for secure document storage in local development.

### Documentation (`/docs`)
- **[plan.md](docs/plan.md)**: Compliance and project implementation plan.
- **[api-docs.md](docs/api-docs.md)**: Details on API endpoints.
- **[frontend-specs.md](docs/frontend-specs.md)**: UI/UX specifications.

---

## 🔑 Mock Credentials (Development)

When using the mock data or seed data, you can use these credentials:

- **Patient**: `jean.dupont@email.com` / `password123`
- **Admin**: `admin@capmobilite.fr` / `admin123`

---

## 🛡️ Compliance & Safety

This project is designed to be **100% compliant** with French regulations:
- Mandatory medical prescription awareness.
- PSDM (Prestataire de Services et Distributeur de Matériel) guidelines.
- HDS (Hébergement de Données de Santé) compatible architecture.
- GDPR transparency.

For more details, see the [Compliance Plan](docs/plan.md).

---

## 📜 License

UNLICENSED - AX TECH © 2026

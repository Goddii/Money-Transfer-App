# Vyloc — Frontend

Vyloc is a mobile-friendly digital wallet and money transfer platform designed to make sending and receiving money simple, accessible, and secure.

This repository contains the **React frontend** for the Vyloc platform. It provides the user interface for authentication, wallet management, M-Pesa deposits, beneficiary management, money transfers, transaction history, analytics, and administration.

-----

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Application Flow](#application-flow)
- [Core User Journey](#core-user-journey)
- [Backend](#backend)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Build for Production](#build-for-production)
- [Design Principles](#design-principles)
- [Project Status](#project-status)
- [Team](#team)
- [License](#license)

---

## Features

### User Features

- User registration and login
- Secure authenticated sessions
- Personal profile management
- Digital wallet and balance
- Add funds through M-Pesa
- Add and manage beneficiaries
- Send money to registered beneficiaries
- Transaction history and transaction details
- Wallet and transaction analytics
- Responsive, mobile-first interface

### Admin Features

- Admin authentication
- User management
- View platform transactions
- Wallet and transaction statistics
- Transaction fee/profit analytics
- Platform activity trends

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React.js |
| State Management | Redux Toolkit |
| Routing | React Router |
| Language | JavaScript |
| Styling | CSS / Responsive UI |
| API Communication | REST API (Flask backend) |
| Testing | Jest |

---

## Project Architecture

```
src/
├── components/
│   ├── common/
│   ├── forms/
│   ├── navigation/
│   └── charts/
│
├── pages/
│   ├── auth/
│   ├── user/
│   └── admin/
│
├── features/
│   ├── auth/
│   ├── wallet/
│   ├── beneficiaries/
│   ├── transactions/
│   └── admin/
│
├── store/
│   └── store.js
│
├── services/
│   └── api.js
│
├── hooks/
├── utils/
├── App.jsx
└── main.jsx
```

---

## Application Flow

```
Register / Login
       ↓
    Dashboard
       ↓
   ┌───┴───────────────┐
   ↓                   ↓
 Wallet            Beneficiaries
   ↓                   ↓
Add Funds          Send Money
   ↓                   ↓
 M-Pesa              Transfer
   └────────┬──────────┘
            ↓
      Transactions
            ↓
        Analytics
```

---

## Core User Journey

```
Create Account
      ↓
    Login
      ↓
Receive Wallet
      ↓
Add Funds via M-Pesa
      ↓
View Wallet Balance
      ↓
Add Beneficiary
      ↓
  Send Money
      ↓
View Transaction Confirmation
      ↓
View Transaction History
      ↓
View Wallet Analytics
```

---

## Backend

The frontend communicates with the **Vyloc Flask REST API**, which is responsible for:

- Authentication
- User management
- Wallet management
- Transactions
- Beneficiaries
- M-Pesa/Daraja integration
- Database operations
- Business logic
- Admin functionality

> **Note:** The frontend does not store or process M-Pesa credentials. Payment credentials and sensitive backend configuration are managed entirely by the Flask backend through environment variables.

---

## Getting Started

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- npm
- Git

### 1. Clone the repository

```bash
git clone <FRONTEND_REPOSITORY_URL>
cd vyloc-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, replace the API URL with the deployed Vyloc backend URL.

### 4. Run the development server

```bash
npm run dev
```

The application will be available at the local development URL displayed by Vite.

---

## Testing

Run the frontend test suite with:

```bash
npm test
```

---

## Build for Production

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## Design Principles

Vyloc's frontend follows these principles:

- **Mobile-first** — designed primarily for mobile users.
- **Simple** — financial actions should require minimal steps.
- **Accessible** — designed to accommodate users with different levels of digital literacy.
- **Transparent** — transaction amounts, fees, and statuses are clearly displayed.
- **Secure** — authenticated and protected application routes.
- **Responsive** — usable across mobile, tablet, and desktop devices.

---

## Project Status

**Status:** In Development — Moringa School Capstone Project

The current MVP focuses on:

- Digital wallets
- M-Pesa wallet funding
- Peer-to-peer transfers
- Beneficiary management
- Transaction history
- User analytics
- Administrative management and analytics

Future versions may introduce additional payment providers, withdrawals, advanced fraud prevention, international transfers, and broader financial interoperability.

---

## Team

Vyloc is being developed as a collaborative Moringa School capstone project.


---

## License

This project was developed as an educational capstone project for Moringa School.

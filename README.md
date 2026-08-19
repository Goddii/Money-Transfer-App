Vyloc — Frontend

Vyloc is a mobile-friendly digital wallet and money transfer platform designed to make sending and receiving money simple, accessible, and secure.

This repository contains the React frontend for the Vyloc platform. It provides the user interface for authentication, wallet management, M-Pesa deposits, beneficiary management, money transfers, transaction history, analytics, and administration.

Features


User Features

User registration and login
Secure authenticated sessions
Personal profile management
Digital wallet and balance
Add funds through M-Pesa
Add and manage beneficiaries
Send money to registered beneficiaries
Transaction history and transaction details
Wallet and transaction analytics
Responsive mobile-first interface


Admin Features

Admin authentication
User management
View platform transactions
Wallet and transaction statistics
Transaction fee/profit analytics
Platform activity trends


Tech Stack

React.js — Frontend framework
Redux Toolkit — Global state management
React Router — Client-side routing
JavaScript
CSS / Responsive UI
REST API — Communication with the Flask backend
Jest — Frontend testing
Project Architecture
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
│
├── utils/
│
├── App.jsx
└── main.jsx
Application Flow
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
Backend

The frontend communicates with the Vyloc Flask REST API.

The backend is responsible for:

Authentication
User management
Wallet management
Transactions
Beneficiaries
M-Pesa/Daraja integration
Database operations
Business logic
Admin functionality

The frontend does not store or process M-Pesa credentials. Payment credentials and sensitive backend configuration are managed by the Flask backend through environment variables.

Getting Started
Prerequisites

Make sure you have installed:

Node.js
npm
Git
Clone the repository
git clone <FRONTEND_REPOSITORY_URL>
cd vyloc-frontend
Install dependencies
npm install
Environment Variables

Create a .env file in the project root:

VITE_API_URL=http://localhost:5000/api

For production, replace the API URL with the deployed Vyloc backend URL.

Run the development server
npm run dev

The application will be available through the local development URL displayed by Vite.

Testing

Run the frontend test suite with:

npm test
Build for Production
npm run build

Preview the production build locally:

npm run preview
Design Principles

Vyloc's frontend follows these principles:

Mobile-first — designed primarily for mobile users.
Simple — financial actions should require minimal steps.
Accessible — designed to accommodate users with different levels of digital literacy.
Transparent — transaction amounts, fees and statuses should be clearly displayed.
Secure — authenticated and protected application routes.
Responsive — usable across mobile, tablet and desktop devices.
Core User Journey

A typical Vyloc user can:

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
Project Status

Status: In Development — Moringa School Capstone Project

The current MVP focuses on:

Digital wallets
M-Pesa wallet funding
Peer-to-peer transfers
Beneficiary management
Transaction history
User analytics
Administrative management and analytics

Future versions may introduce additional payment providers, withdrawals, advanced fraud prevention, international transfers and broader financial interoperability.

Team

Vyloc is being developed as a collaborative Moringa School capstone project.

Project Team

Godwin — Scrum Master / Product & Integration
Robbin — Backend & Database
Lenny — Frontend
Leon — Testing & Administration
License

This project was developed as an educational capstone project for Moringa School.
# Spendora — Broke But Functional

### Survive the Month. Master Your Money.

**Spendora** is a modern, responsive personal finance management web application designed to help students and young professionals track expenses, manage monthly budgets, build savings habits, and make smarter financial decisions.

Developed for the hackathon problem statement **"Broke But Functional — Survive the Month."**

---

## Live Demo

**Live Website:** https://spendora.onrender.com

**GitHub Repository:** https://github.com/Ravneet-project/spendora

*Confirm the live deployment URL before publishing.*

## Problem Statement

Managing finances on a limited monthly income can be challenging, especially for students and young professionals.

Unplanned purchases, recurring subscriptions, and a lack of spending awareness can make it difficult to manage expenses throughout the month.

Spendora addresses these challenges by providing a centralized financial dashboard where users can monitor their income, track expenses, plan budgets, and work toward savings goals.

## Key Features

### 1. Interactive Financial Dashboard
- Overview of total income, expenses, and available balance.
- Visual representation of financial activity.
- Monthly financial summaries and insights.
- Interactive charts for spending analysis.

### 2. Transaction Management
- Add income and expense transactions.
- View transaction history.
- Search and filter transactions.
- Delete transactions.
- Monitor overall spending activity.

### 3. Budget Planning
- Set monthly income and spending targets.
- Allocate budgets based on financial priorities.
- Compare planned and actual expenses.
- Receive budget alerts.
- Track available monthly funds.

### 4. Savings Goals
- Set personal savings targets.
- Monitor progress toward financial goals.
- Encourage consistent saving habits.

### 5. Subscription Tracking
- Track recurring subscriptions.
- View upcoming payments.
- Improve awareness of fixed monthly expenses.

### 6. Financial Challenges
- Encourage responsible spending habits.
- Promote financial discipline through interactive challenges.

### 7. Responsive User Interface
- Clean and modern design.
- Responsive layouts for desktop and mobile devices.
- Interactive animations and visual components.
- Simple and intuitive navigation.

## Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| Vite | Development and production build |
| JavaScript | Application functionality |
| Tailwind CSS | Styling |
| Bootstrap | Responsive UI components |
| React Router | Client-side routing |
| Recharts | Financial data visualization |
| Motion | UI animations |
| Lucide React | Icons |
| LocalStorage | Browser-based data persistence |
| GitHub | Version control |
| Render | Application deployment |

## Installation and Setup

### Prerequisites

Ensure the following tools are installed:

- Node.js
- npm
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/Ravneet-project/spendora.git
```

### Step 2: Navigate to the Project Directory

```bash
cd spendora
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Start the Development Server

```bash
npm run dev
```

Open the local development URL displayed in the terminal.

### Step 5: Build for Production

```bash
npm run build
```

The production-ready files will be generated in the `dist` directory.

## Project Structure

```text
spendora/
├── public/
├── src/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Data Management

Spendora uses browser LocalStorage to preserve financial data.

This allows users to maintain their transaction history, budget settings, and other financial information across page refreshes within the same browser.

**Current limitation:** Financial data is stored locally and is not synchronized across devices. Clearing browser storage may remove saved information.

## Deployment

The application is deployed using Render Static Sites.

### Build Command

```bash
npm install && npm run build
```

### Publish Directory

```text
dist
```

### React Router Configuration

To support direct navigation and page refreshes, configure the following rewrite rule in Render:

```text
Source: /*
Destination: /index.html
Action: Rewrite
```

## Future Enhancements

- Secure user authentication and account management.
- Cloud-based database integration.
- AI-powered expense categorization.
- Personalized financial recommendations.
- Automated payment reminders.
- Monthly financial reports.
- CSV and PDF export functionality.
- Cross-device data synchronization.

## Hackathon Information

**Project Name:** Spendora

**Problem Statement:** Broke But Functional — Survive the Month

**Category:** Personal Finance / FinTech

**Objective:** To simplify personal finance management and help users make informed spending decisions throughout the month.

## Developer

**GitHub:** https://github.com/Ravneet-project

**Repository:** https://github.com/Ravneet-project/spendora

---

**Spendora — Because surviving the month should not be a financial mystery.**

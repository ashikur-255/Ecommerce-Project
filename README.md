# 🛒 E-Commerce Full-Stack Platform

<div align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Backend-ASP.NET_Core-purple?style=for-the-badge&logo=dotnet" alt=".NET" />
  <img src="https://img.shields.io/badge/Database-SQL_Server-red?style=for-the-badge&logo=microsoft-sql-server" alt="SQL Server" />
  <img src="https://img.shields.io/badge/Deployment-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</div>

<br />

## 📖 Project Overview
A complete full-stack e-commerce platform featuring a modern UI/UX on the frontend and a robust, scalable backend API. This project uses a **Monorepo** architecture, housing both frontend and backend codebases in a single repository for streamlined development and Docker deployment.

<img width="2880" height="10297" alt="Ecommerce_websites" src="https://github.com/user-attachments/assets/bb410b62-d184-4444-a280-f8ebc8b89e04" />



## ✨ Key Features
* **User Authentication:** Secure registration and login.
* **Product Management:** Browse, search, and filter products seamlessly.
* **Shopping Cart & Checkout:** Manage cart items and process orders efficiently.
* **Admin Dashboard:** Manage products, orders, inventory, and users.
* **Responsive Design:** Fully responsive UI for both mobile and desktop views.
* **Containerized:** Easy deployment and local testing using Docker.

## 💻 Tech Stack
* **Frontend:** React.js / Vite, Tailwind CSS
* **Backend:** C# ASP.NET Core Web API 
* **Database:** MS SQL Server
* **DevOps:** Docker, Docker Compose

## 📂 Folder Structure
```text
Ecommerce-Project/
├── frontend/             # Frontend application (React/UI)
├── backend/              # Backend application (ASP.NET Core API)
├── docker-compose.yml    # Docker configuration for full-stack deployment
└── README.md             # Project documentation

🚀 Getting Started
Prerequisites
Make sure you have the following installed on your local machine:
Git
Docker Desktop
Node.js (If running frontend locally without Docker)
.NET SDK (If running backend locally without Docker)

Installation & Setup

1. Clone the repository:
git clone [https://github.com/ashikur-255/Ecommerce-Web.git](https://github.com/ashikur-255/Ecommerce-Web.git)
cd Ecommerce-Web

2. Run with Docker (Recommended):
To run both the frontend and backend simultaneously using Docker Compose:
docker-compose up --build -d
Frontend will be accessible at: http://localhost:3000 (or your configured port)
Backend API / Swagger will be accessible at: http://localhost:5000

Running Locally (Without Docker)
Backend:
cd backend
dotnet run

Frontend:
cd frontend
npm install
npm run dev

👤 Author
MD. ASHIKUR RAHMAN
GitHub: @ashikur-255
Portfolio: ashikurr-portfolio.netlify.app

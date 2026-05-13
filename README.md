# 📐 Structura | Blueprint Resource Scheduler

[![React 19](https://img.shields.io/badge/React-19.x-61dafb.svg?style=flat-for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7.x-646cff.svg?style=flat-for-the-badge&logo=vite)](https://vite.dev)
[![Tailwind v4](https://img.shields.io/badge/Tailwind-v4.0-38bdf8.svg?style=flat-for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Node](https://img.shields.io/badge/Node-Express-000000.svg?style=flat-for-the-badge&logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47a248.svg?style=flat-for-the-badge&logo=mongodb)](https://www.mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101.svg?style=flat-for-the-badge&logo=socketdotio)](https://socket.io)

**Structura** (Blueprint Resource Scheduler) is a comprehensive, full-stack resource management and scheduling platform built to streamline reservations of computer labs, auditoriums, classrooms, and conference rooms.

Designed with a premium, creative **"architectural blueprint" aesthetic**, the platform ditches cookie-cutter corporate grids for dynamic hand-drawn tape accents, blueprint grid backgrounds, and custom canvas-driven simulations. It offers high-fidelity experiences across three user roles: **Students/Users**, **Administrators**, and **Maintenance Staff**.

---

## 🏛️ System Architecture

The following diagram illustrates the real-time, event-driven data flow and multi-tier role-based structure of Structura:

```mermaid
graph TD
    classDef client fill:#1e293b,stroke:#0ea5e9,stroke-width:2px,color:#fff;
    classDef server fill:#18181b,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef database fill:#022c22,stroke:#059669,stroke-width:2px,color:#fff;
    classDef socket fill:#1e1b4b,stroke:#6366f1,stroke-width:2px,color:#fff;

    subgraph Client ["Frontend (React 19 + Vite)"]
        A["Interactive UI Components"]:::client
        B["Three.js / React Three Fiber (3D Blueprint Scene)"]:::client
        C["Matter.js (2D Rigid-Body Physics Canvas)"]:::client
        D["Axios Interceptors (JWT Headers)"]:::client
        E["Socket.io-Client (Live Updates)"]:::client
    end

    subgraph Server ["Backend (Node.js + Express)"]
        F["API Gateway & Express Router"]:::server
        G["JWT Auth & RBAC Middleware"]:::server
        H["Scheduling & Conflict Algorithm"]:::server
        I["Socket.io Engine (Room Management)"]:::server
    end

    subgraph DB ["Database (MongoDB Cloud)"]
        J[("Mongoose Models (User, Booking, Resource, Chat)")]:::database
    end

    A --> B
    A --> C
    A --> D
    D -->|"HTTP Rest API"| F
    E <-->|"WebSockets (Real-time Chat & Toasts)"| I
    F --> G
    G --> H
    H <--> J
    I <--> J

    class I socket;
    class E socket;
```

---

## ✨ Core Features

### 🔑 1. Multi-Tier Role-Based Access Control (RBAC)
* **Students/Users:** Browse live facility inventory, submit custom booking requests, track booking histories, and open support chats with administration.
* **Administrators:** Oversee analytics dashboards, approve or deny requests, toggle system settings (e.g., Maintenance Mode), and answer live client support threads.
* **Maintenance Staff:** Track automated sanitation workflows and update cleanup statuses.

### 🧹 2. Intelligent Conflict-Prevention & Auto-Scheduling
* **Automated Buffers:** The system automatically places a **30-minute cleaning and maintenance buffer** immediately following any approved booking, ensuring the room is sanitized.
* **Schedule Optimization (Garbage Collection):** If a booking is subsequently cancelled or rejected, the system automatically purges the associated buffer, freeing up the inventory.
* **Overlap Protection:** Database-level transactional validation blocks simultaneous overlaps.

### 💬 3. Real-Time Room-Based Sockets
* **Dedicated Help Desks:** Users can open persistent real-time chat sessions with Admin. Sockets are separated into room ids (e.g., `user_123`, `admin`) to protect communications.
* **Global Push Alerts:** Custom-animated, socket-triggered toast alerts notify users instantly when an administrator approves/rejects bookings.

### 📐 4. Immersive Canvas Simulations
* **Three.js 3D Blueprint:** Features fully responsive, interactive architectural models that smoothly rotate and scale dynamically based on your viewport.
* **Matter.js 2D Physics:** Responsive physical tags representing system properties that drag, bounce, and interact.
  * **Touch-Repulsion Shockwaves:** Tapping or clicking anywhere in the container unleashes an immediate outwards velocity impulse (shockwave) that flings nearby bodies away.
  * **Device Tilt Gravity:** Mobile gyroscope integration maps phone tilt (`gamma`/`beta`) directly to real-time 2D physics gravity vectors.

---

## 🛠️ Technology Stack

| Part | Tech Stack |
| :--- | :--- |
| **Frontend Core** | React 19 (Vite), React Router v7, Axios (Interceptors) |
| **Styling & Icons** | Tailwind CSS v4, Lucide React |
| **Animations & 3D** | GSAP, Three.js, React Three Fiber (R3F), `@react-three/drei` |
| **2D Physics** | Matter.js |
| **Backend Core** | Node.js, Express.js, Socket.io |
| **Database** | MongoDB & Mongoose ODM |
| **Security** | JSON Web Tokens (JWT), bcryptjs |

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org) (v18+ recommended)
* [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or a local MongoDB database instance

---

### 1. Setup Backend Server

1. Open your terminal and navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Backend` directory and define your configurations:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_signing_key
   ```
4. Seed the database with initial resources and administrative accounts:
   ```bash
   node seed_db.js
   ```
5. Run the server in development watch mode:
   ```bash
   npm start
   ```
   *The backend server will run on `http://localhost:5000`.*

---

### 2. Setup Frontend Application

1. In a new terminal window, navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Start the Vite development hot-reloading server:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser to experience Structura.*

---

## 📦 Production Builds & Deployment

### Compile Frontend Asset Bundles
To generate optimized, static HTML/CSS/JS bundles for Vercel, Netlify, or AWS:
```bash
cd Frontend
npm run build
```
This produces a compiled, light-weight build folder under `Frontend/dist`.

---

## 📜 Development & Support Credits
Project created as an advanced, high-fidelity resource manager. For maintenance, bugs, or feature additions, please submit a pull request or open an issue on the repository.

*Designed with ❤️, Precision, and Blueprint aesthetics.*

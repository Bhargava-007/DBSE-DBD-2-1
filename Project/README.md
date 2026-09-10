# ⚡ AlgoFlow — Modern Online Code Judge & Competitive Programming Platform

AlgoFlow is a distributed, high-performance online judge and competitive programming platform. It features an award-winning dark/light UI design system (inspired by Linear and Vercel), a rich Monaco-powered workspace, live contest leaderboards, sandboxed execution runtimes, and real-time telemetry.

---

## ✨ Features

- **🎨 Linear / Vercel Design System**: Pixel-perfect dark and light themes with micro-animations and zero clutter.
- **💻 Monaco Code Editor**: Full syntax highlighting, auto-completion, font size adjustment, and starter code templates for **C++**, **Python**, **Java**, and **JavaScript**.
- **🧪 Real-Time Test Case Runner**:
  - Sample test cases with expected vs actual output validation.
  - **+ Custom Input**: Test arbitrary standard input (stdin) with live CPU runtime and memory telemetry.
  - Detailed compilation error traces, runtime diagnostics, and sandbox debug logs.
- **🏆 Live Contests & Leaderboards**: Real-time ranking with Redis Sorted Sets and WebSocket live updates.
- **🔍 Problem Catalog & Discovery**: Filter by difficulty (Easy, Medium, Hard), status (Solved, Attempted, Todo), and topic tags (Arrays, Dynamic Programming, Graphs, etc.).
- **⚡ Command Palette (`Ctrl + K` / `⌘K`)**: Instant navigation to any problem, contest, or submission.
- **📊 User Dashboard**: Track your rating, problem statistics, recent submissions, and progress badges.
- **➕ Problem Setter Studio**: Admin modal to publish new problems with custom constraints and test suites.

---

## 🚀 Quick Start Guide

### Option 1: Standalone Web App (No Docker or Database Required)
Anyone who downloads this repository can run the entire platform locally in seconds:

```bash
# 1. Clone or download the repository
git clone <your-repository-url>
cd Project

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.  
Everything works out of the box with the built-in execution engine, problem catalog, editor, and contest views!

---

### Option 2: Full Distributed Microservices (Docker Compose)
If you have **Docker Desktop** installed on Windows, Mac, or Linux and want to run all isolated backend microservices:

```bash
# Start all 6 microservices (MongoDB, Redis, API Gateway, Judge Worker, Contest WebSocket, Plagiarism Engine)
docker compose up --build
```

**Services launched:**
- **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- **API Gateway**: [http://localhost:4000/api](http://localhost:4000/api)
- **Contest WebSockets**: `ws://localhost:4001`
- **MongoDB**: `localhost:27017`
- **Redis Cache & BullMQ**: `localhost:6379`

---

### Option 3: Windows Local Services (`start.bat`)
On Windows, you can launch all native microservices at once using the included batch script:

1. Double-click `start.bat` or run in terminal:
   ```cmd
   start.bat
   ```
2. The script will automatically launch:
   - Native MongoDB daemon (`port 27017`)
   - Native Redis server (`port 6379`)
   - API Gateway (`port 4000`)
   - Contest Service (`port 4001`)
   - Judge Worker (BullMQ consumer)
   - Plagiarism Service (`port 4002`)
   - React Frontend (`port 5173`)

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + Enter` / `⌘ + Enter` | **Run Code** on sample test cases or custom input |
| `Ctrl + Shift + Enter` / `⌘ + Shift + Enter` | **Submit Solution** for full evaluation |
| `Ctrl + K` / `⌘ + K` | Open **Quick Search / Command Palette** |
| `Ctrl + \` / `⌘ + \` | Toggle **Test Case Console** |

---

## 📁 Repository Structure

```
Project/
├── backend/
│   ├── api-gateway/         # Express REST API, Auth, Submissions, Problems routes
│   ├── judge-worker/        # BullMQ worker & Docker sandboxed code execution
│   ├── contest-service/     # WebSocket server for real-time live contest leaderboards
│   ├── plagiarism-service/  # Winnowing AST / token-based code plagiarism detector
│   └── shared/              # Shared TypeScript types and utilities
├── src/
│   ├── api/                 # Axios API clients for backend communication
│   ├── components/
│   │   ├── auth/            # Login & Register authentication modals
│   │   ├── catalog/         # Problem catalog, search filters, and tag selector
│   │   ├── common/          # Badges, Command Palette, Navbar, Theme toggler
│   │   ├── contests/        # Contests list, countdown timers, and live leaderboard
│   │   ├── problems/        # Create problem modal and setter tools
│   │   └── workspace/       # Monaco code editor, Description pane, Console runner
│   ├── context/             # Global JudgeContext state management
│   ├── utils/               # Code evaluator, input parsers, and problem solvers
│   ├── types/               # TypeScript interfaces (Problem, Submission, Verdict, etc.)
│   ├── App.tsx              # Root application router and layout
│   └── index.css            # Linear/Vercel design system CSS variables and utilities
├── docker-compose.yml       # Production multi-container composition
├── start.bat                # 1-click Windows multi-service launcher
└── package.json             # Root frontend dependencies and build scripts
```

---

## 🌐 Deploying to the Web

You can deploy the AlgoFlow frontend to **Vercel** or **Netlify** with zero configuration:

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) or [Netlify](https://netlify.com) and import your repository.
3. Keep default build settings (`Build Command: npm run build`, `Output Directory: dist`).
4. Click **Deploy** — your live judge platform URL will be ready in under a minute!

---

## 🛠️ Built With

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Editor**: [@monaco-editor/react](https://microsoft.github.io/monaco-editor/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend**: [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/)
- **Database & Cache**: [MongoDB](https://www.mongodb.com/), [Redis](https://redis.io/), [BullMQ](https://bullmq.io/)
- **Container Sandbox**: [Dockerode](https://github.com/apocas/dockerode) & Docker Linux Containers

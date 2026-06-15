<<<<<<< HEAD
# LearnVault 🧠

LearnVault is a highly polished, responsive full-stack SaaS-style web application designed for students to organize, track, and revise topics they learn. It combines robust tracking mechanics like **Learning Streaks**, a **Revision Planner Calendar**, and comprehensive **Markdown Notebooks** with smooth animations and layout states.

---

## 🚀 Key Visual & Functional Features

1. **Academic Concentration Dashboard**:
   - Welcome sections that adapt dynamically based on hours of the day.
   - Animated SVG circular ratio loaders showing vault completion indices.
   - Double-split layout arrays presenting recent activity alongside concentration ratios.
   - Pure SVG visual charts detailing difficulty and weekly activity distributions.

2. **Personal Revision Scheduler**:
   - 42-day calendar grids highlighting study dates (purple targets) and scheduled review timelines (neon blue items).
   - Sidebar checklists grouping calendar actions intelligently.
   - Native quick spaced-repetition suggestion offsets based on difficulty profiles.

3. **Topics Vault Ledger**:
   - Live query options including text-search, category drop-downs, status selectors, and sorting offsets (newest, oldest, revision target).
   - Segmented notes sidecard presenting full inline **Markdown Previews** (parsing hashtags as headers, blockquotes, bullets, inline code ticks, and line-item checkboxes).
   - In-app styled layouts allowing students to print or export notebooks instantly as structured PDF files.

4. **Robust Auth Gate & Streak Tracker**:
   - Register and login portals with secure salted hashes and JWT signatures.
   - Automated sequential learning streak meters calculating consecutive revision active periods.

---

## 🛠️ Core Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Framer Motion, and Lucide Icons.
- **Backend**: Node.js & Express API servers.
- **Data Engine**: Dual-driven persistence model. Out-of-the-box, it operates on a secure local JSON system to make sure the app works perfectly inside the preview playground. It behaves identically to MongoDB document schemas and handles logins, registers, CRUD actions, and calendar updates smoothly.

---

## 📂 Project Architecture

```bash
├── data/
│   └── learnvault_db.json        # Persistent JSON storage file (behaves like MongoDB documents)
├── server/
│   ├── authController.ts         # User auth, password comparison, and streak updates
│   ├── topicController.ts        # Topics CRUD stats calculation, and activity meters
│   ├── db.ts                     # Schema definitions, read/write routines
│   └── middleware.ts             # JWT token checker and request logs
├── src/
│   ├── components/
│   │   ├── CalendarView.tsx      # study and revision schedules calendar tracker
│   │   ├── LoadingSkeleton.tsx   # Shimmering load boxes
│   │   ├── MarkdownRenderer.tsx  # Inline regex markdown tokenizer
│   │   ├── Sidebar.tsx           # Navigation drawer
│   │   ├── StatsGrid.tsx         # Dashboard graphics
│   │   └── TopicModal.tsx        # Multi-field study manager dialog
│   ├── App.tsx                   # Central React controller and portal gates
│   ├── api.ts                    # Front-end request headers adapter
│   └── types.ts                  # Type declarations and interfaces
├── server.ts                     # Unified Express entry (injects Vite connectors)
├── index.html                    # Root HTML
├── metadata.json                 # Project descriptor metadata
├── package.json                  # Dependencies configuration
└── tsconfig.json                 # compiler configurations
```

---

## 📡 REST API Directory

### Auth Gates
* `POST /api/auth/register` - Creates a new user profile.
* `POST /api/auth/login` - Verifies keys, updates consecutive study streaks, returns JWT.
* `GET /api/auth/profile` - Refreshes student statistics.

### Topic Operations
* `GET /api/topics` - Fetches filtered lists of study items.
* `POST /api/topics` - Secures a new studied topic into the vault.
* `GET /api/topics/:id` - Detailed view of a single study.
* `PUT /api/topics/:id` - Updates notes, revision due-dates, or completion statuses.
* `DELETE /api/topics/:id` - Erases a topic milestone from the vault.

### Dashboard Analytics
* `GET /api/stats` - Compiles total items, status indexes, difficulty spectrum ratios, weekly activity bars, and streak counts.

---

## 🧪 Installation & Boot Guide

To execute LearnVault locally:

### 1. Acquire Dependencies
Make sure you have Node.js installed. In the root directory, install all required packages:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root using the provided `.env.example` placeholder:
```bash
JWT_SECRET=your_custom_secret_key_here
NODE_ENV=development
```

### 3. Launch Development Server
Launch the unified full-stack dev server:
```bash
npm run dev
```
The server integrates Vite middleware and compiles assets on-the-fly. Open **`http://localhost:3000`** in your browser!

### 4. Build Standalone Production Casing
To compile the applet into an optimized, self-contained portable structure:
```bash
npm run build
```
This builds statically compiled HTML/JS files in `/dist` and uses `esbuild` to compile `/server.ts` into a lightweight, single-file CommonJS module inside `/dist/server.cjs`.

To boot the compiled production server:
```bash
npm run start
```
=======
# 📚 LearnVault

> Transform the way you learn, revise, and track academic progress.

LearnVault is a modern study management platform built for students who want to organize their learning journey, stay consistent, and achieve better results through structured revision and progress tracking.

Whether you're preparing for university exams, competitive exams like GATE, or simply learning new skills, LearnVault provides a centralized workspace to capture knowledge, schedule revisions, and monitor growth.

---

## 🚀 Why LearnVault?

Most students struggle with:

* Forgetting previously learned topics
* Unstructured revision schedules
* Lack of progress visibility
* Scattered notes across multiple platforms
* Inconsistent study habits

LearnVault solves these problems by combining topic tracking, revision planning, analytics, and note management into a single platform.

---

## ✨ Key Features

### 📖 Topic Vault

Create and organize learning topics with categories, difficulty levels, status tracking, and detailed notes.

### 📅 Revision Calendar

Plan revision sessions intelligently and maintain long-term retention of important concepts.

### 📊 Academic Analytics Dashboard

Gain insights into your learning progress through visual statistics and performance metrics.

### 🔥 Learning Streak System

Build consistency with study streaks and progress monitoring.

### 📝 Markdown Notes Support

Write structured notes using Markdown formatting for better readability and organization.

### 🔐 Secure Authentication

User accounts protected with JWT authentication and password hashing.

### 🌙 Modern User Experience

Clean dark-themed interface designed for long study sessions with minimal distractions.

### ⚡ Real-Time Progress Tracking

Monitor completed, revising, and pending topics from a centralized dashboard.

---

## 🖼️ Dashboard Highlights

* Study Progress Overview
* Completion Analytics
* Learning Streak Tracking
* Topic Management
* Revision Scheduling
* Academic Category Distribution
* Personalized Learning Workspace

---

## 🎯 Ideal For

* Engineering Students
* GATE Aspirants
* University Students
* Self-Learners
* Competitive Exam Preparation
* Online Course Learners

---

## 🛠️ Technology Stack

### Frontend

* React
* TypeScript
* Vite

### Backend

* Node.js
* Express.js

### Security

* JWT Authentication
* bcrypt Password Hashing

### Storage

* JSON Database

---

## 📈 Future Roadmap

### Version 2.0

* 🤖 AI-powered study assistant
* 🧠 Smart revision recommendations
* 📄 PDF export support
* 📊 Advanced analytics
* ☁️ Cloud database integration
* 📱 Mobile application
* 🎯 GATE preparation mode
* 🔔 Revision reminders and notifications
* 🏆 Achievement and gamification system

---

## 🌟 Vision

LearnVault aims to become a personal academic operating system where students can manage learning, track progress, revise effectively, and build long-term knowledge retention.

Instead of simply storing notes, LearnVault helps students build a structured path toward mastery.

---

## 📬 Feedback & Contributions

Contributions, feature suggestions, and feedback are welcome.

If you find this project useful, consider giving it a ⭐ and sharing your ideas for future improvements.

---

**Built with ❤️ for students who want to learn smarter, not harder.**
>>>>>>> 057a78b3026e1a3dff23d0277de724d47abb56bf

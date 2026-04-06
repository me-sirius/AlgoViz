<div align="center">

# 🚀 AlgoViz Pro

### *The Ultimate Algorithm Visualization & Learning Platform*

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

---

**Visualize. Learn. Master Algorithms.**

*An immersive, interactive platform for understanding algorithms through beautiful step-by-step visualizations, AI-powered assistance, and comprehensive learning resources.*

[View Demo](#) • [Report Bug](#) • [Request Feature](#)

</div>

---

## ✨ Features at a Glance

| Feature | Description |
|---------|-------------|
| 🎬 **35+ Algorithm Visualizations** | Step-by-step animations with playback controls |
| 🤖 **AI ChatBot** | Powered by Google Gemini for algorithm explanations |
| 💻 **Practice IDE** | Code and test algorithms in real-time |
| 📚 **Learning Paths** | Structured courses for systematic learning |
| 📖 **Cheat Sheets** | Quick reference for all algorithms |
| 🎯 **Interview Experiences** | Real interview stories and preparation tips |
| 🌙 **Dark Mode** | Stunning glassmorphism UI design |
| 📱 **Fully Responsive** | Works seamlessly on all devices |

---

## 🎯 Algorithm Categories

<table>
<tr>
<td width="50%">

### 📊 Arrays & Sorting
- Bubble Sort
- Selection Sort
- Insertion Sort
- Merge Sort
- Quick Sort
- Heap Sort

</td>
<td width="50%">

### 🔍 Search Algorithms
- Linear Search
- Binary Search
- Jump Search
- Interpolation Search
- Exponential Search

</td>
</tr>
<tr>
<td width="50%">

### 🌳 Trees & Graphs
- Tree Traversal (Inorder, Preorder, Postorder)
- Binary Search Tree
- AVL Tree
- BFS (Breadth-First Search)
- DFS (Depth-First Search)
- Dijkstra's Algorithm

</td>
<td width="50%">

### 📈 Dynamic Programming
- Fibonacci Sequence
- Coin Change Problem
- Longest Common Subsequence
- Edit Distance
- 0/1 Knapsack
- Climbing Stairs

</td>
</tr>
<tr>
<td width="50%">

### 🎯 Greedy Algorithms
- Activity Selection
- Huffman Coding
- Prim's MST
- Kruskal's MST
- Union Find

</td>
<td width="50%">

### 🔙 Backtracking
- N-Queens Problem
- Sudoku Solver
- Maze Solver
- Subset Sum
- Word Search

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework with latest features |
| **Vite 7** | Lightning-fast build tool |
| **Tailwind CSS 4** | Utility-first styling |
| **Framer Motion** | Smooth animations & transitions |
| **Cytoscape.js** | Graph visualization engine |
| **Monaco Editor** | VS Code-like code editor |
| **Lucide React** | Beautiful icon library |

### Backend
| Technology | Purpose |
|------------|---------|
| **Express 5** | Web server framework |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT** | Secure authentication |
| **bcrypt** | Password hashing |
| **Google GenAI** | AI-powered chatbot |
| **Nodemailer** | Email services |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/algoviz.git
cd algoviz

# Install Frontend dependencies
cd Frontend
npm install

# Install Backend dependencies
cd ../Backend
npm install
```

### Environment Setup

**Backend (.env)**
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/algoviz
JWT_SECRET=your_super_secret_key
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Run Development Servers

```bash
# Terminal 1: Start Backend
cd Backend
npm start

# Terminal 2: Start Frontend
cd Frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

---

## 📁 Project Structure

```
AlgoViz/
├── Frontend/
│   ├── src/
│   │   ├── algorithms/       # Code examples for each algorithm
│   │   ├── components/
│   │   │   ├── algorithms/   # 35+ algorithm visualizers
│   │   │   │   ├── Arrays and Sorting/
│   │   │   │   ├── Backtracking/
│   │   │   │   ├── Dynamic Programming/
│   │   │   │   ├── Greedy Algorithms/
│   │   │   │   ├── Search Algorithms/
│   │   │   │   └── Trees and Graphs/
│   │   │   ├── ChatBot.jsx
│   │   │   ├── PracticeIDE.jsx
│   │   │   ├── CheatSheet.jsx
│   │   │   └── ... (30+ shared components)
│   │   ├── context/          # Theme & Auth context
│   │   ├── data/             # Static data & configurations
│   │   └── utils/            # Helper functions
│   └── package.json
│
├── Backend/
│   ├── controllers/          # Route handlers
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API endpoints
│   ├── middlewares/          # Auth & validation
│   ├── db/                   # Database connection
│   └── app.js                # Express server
│
└── Readme.md
```

---

## 🎨 Design Philosophy

AlgoViz Pro follows the **"Immersive Studio"** design standard:

| Principle | Implementation |
|-----------|----------------|
| **Dark Mode First** | Deep blacks (#0b0b0d) with vibrant accents |
| **Glassmorphism** | Elegant blur effects and transparency |
| **Floating UI** | Detached controls that animate with content |
| **Micro-animations** | Smooth transitions on every interaction |
| **Responsive** | Mobile-first with xl breakpoint optimizations |

---

## 🔐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/register` | Create new account |
| POST | `/users/login` | User login |
| GET | `/users/profile` | Get user profile |

### AI Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/chat` | Send message to AI |

---

## 🧪 Visualization Features

Each algorithm visualizer includes:

- ▶️ **Play/Pause** - Control animation playback
- ⏭️ **Step Forward/Back** - Navigate frame by frame
- 🎚️ **Speed Control** - Adjust animation speed (0.5x - 10x)
- 📊 **Timeline Scrubber** - Jump to any step
- 💬 **Commentary** - Human-readable step explanations
- 📝 **Code Panel** - Synced code highlighting (C++, Python, JS)
- 🔄 **Reset** - Start visualization from beginning
- ⚙️ **Configuration** - Customize input parameters

---

## 📊 Performance

- ⚡ **Vite** for sub-second HMR
- 🎯 **Pre-computed steps** for instant scrubbing
- 📦 **Lazy loading** for algorithm components
- 🖼️ **Optimized animations** with Framer Motion

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Authors

- **Ratan** - *Visionary & Core Logics*
- **Anup** - *Frontend & UI/UX*
- **Vishnu** - *Backend & Code Testing*

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

**Made with ❤️ for the developer community**

</div>

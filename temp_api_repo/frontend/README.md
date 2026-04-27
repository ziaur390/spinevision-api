# SPINEVISION-AI Frontend

> React-based frontend for the AI Spine Disease Detection System

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Access the app at: http://localhost:3000

## 📁 Project Structure

```
frontend/
├── src/
│   ├── assets/              # Logo and images
│   ├── components/
│   │   ├── Navbar.jsx       # Top navigation
│   │   ├── Sidebar.jsx      # Side navigation
│   │   └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── Login.jsx        # Authentication
│   │   ├── Dashboard.jsx    # Main dashboard
│   │   ├── Upload.jsx       # X-ray upload
│   │   ├── Processing.jsx   # Loading state
│   │   ├── Result.jsx       # Analysis results
│   │   └── History.jsx      # Upload history
│   ├── services/
│   │   └── api.js           # Backend API calls
│   ├── App.jsx              # Route configuration
│   ├── main.jsx             # Entry point
│   └── index.css            # Tailwind + custom styles
├── index.html
├── vite.config.js
└── package.json
```

## 🔌 Backend Connection

The frontend connects to the FastAPI backend at `http://localhost:8000`.

Make sure the backend is running before starting the frontend:

```bash
# In backend folder
uvicorn app.main:app --reload --port 8000
```

## 📱 Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | User authentication |
| Dashboard | `/dashboard` | Statistics and quick actions |
| Upload | `/upload` | Drag & drop X-ray upload |
| Processing | `/processing/:id` | Analysis loading |
| Result | `/result/:id` | View predictions & heatmap |
| History | `/history` | Past uploads and results |

## 🎨 Design

- **Color Scheme**: Teal/Cyan medical theme
- **Typography**: Inter font family
- **UI**: Clean, professional, medical-grade
- **Animations**: Smooth fade-in transitions

## 🛠️ Technologies

- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios

## 📋 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

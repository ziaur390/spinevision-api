# SPINEVISION AI - Quick Start Guide

## ⚡ One-Command Start (Recommended)

### Windows
```batch
start.bat
```

### Mac/Linux
```bash
chmod +x start.sh
./start.sh
```

---

## 🛠️ Manual Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- Git

### Step 1: Clone Repository
```bash
git clone https://github.com/ziaur390/SPINEVISION-AI.git
cd SPINEVISION-AI
```

### Step 2: Setup Backend
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend
uvicorn app.main:app --reload --port 8000
```

### Step 3: Setup Frontend (New Terminal)
```bash
cd frontend

# Install dependencies
npm install

# Run frontend
npm run dev
```

---

## 🌐 Access URLs

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8000 |
| **API Docs (Swagger)** | http://localhost:8000/docs |

---

## 🔐 First Time Usage

1. Open http://localhost:3000/register
2. Create an account
3. Login and start uploading X-rays!

---

## 📁 Project Structure

```
SPINEVISION_AI/
├── backend/           # FastAPI Python backend
│   ├── app/          # API, services, database
│   ├── storage/      # Uploaded files
│   └── requirements.txt
├── frontend/          # React Vite frontend
│   ├── src/          # Components, pages
│   └── package.json
├── start.bat          # Windows start script
└── start.sh           # Unix start script
```

---

## 🔧 Common Issues

### Backend won't start
```bash
# Make sure you're in virtual environment
cd backend
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Frontend won't start
```bash
cd frontend
npm install
```

### Port already in use
```bash
# Kill processes on port 8000 (backend)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Kill processes on port 3000 (frontend)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 📞 Quick Commands

| Action | Command |
|--------|---------|
| Start All | `start.bat` |
| Start Backend Only | `cd backend && venv\Scripts\activate && uvicorn app.main:app --reload` |
| Start Frontend Only | `cd frontend && npm run dev` |
| Install Backend Deps | `cd backend && pip install -r requirements.txt` |
| Install Frontend Deps | `cd frontend && npm install` |

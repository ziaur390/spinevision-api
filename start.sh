#!/bin/bash
echo "========================================"
echo "  SPINEVISION AI - Quick Start"
echo "========================================"
echo

# Check if backend venv exists
if [ ! -d "backend/venv" ]; then
    echo "[1/4] Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    cd ..
fi

# Install backend dependencies
echo "[2/4] Installing backend dependencies..."
cd backend
source venv/bin/activate
pip install -r requirements.txt -q
cd ..

# Install frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
    echo "[3/4] Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
else
    echo "[3/4] Frontend dependencies already installed."
fi

echo "[4/4] Starting servers..."
echo
echo "========================================"
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo "  API Docs: http://localhost:8000/docs"
echo "========================================"
echo
echo "Press Ctrl+C to stop both servers."
echo

# Start backend in background
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
cd frontend
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null" EXIT

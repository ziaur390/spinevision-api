@echo off
echo ========================================
echo   SPINEVISION AI - Quick Start
echo ========================================
echo.

:: Check if backend venv exists
if not exist "backend\venv" (
    echo [1/4] Creating Python virtual environment...
    cd backend
    python -m venv venv
    cd ..
)

:: Install backend dependencies
echo [2/4] Installing backend dependencies...
cd backend
call venv\Scripts\activate.bat
pip install -r requirements.txt -q
cd ..

:: Install frontend dependencies
if not exist "frontend\node_modules" (
    echo [3/4] Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
) else (
    echo [3/4] Frontend dependencies already installed.
)

echo [4/4] Starting servers...
echo.
echo ========================================
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo   API Docs: http://localhost:8000/docs
echo ========================================
echo.
echo Press Ctrl+C to stop both servers.
echo.

:: Start backend in background
start "SPINEVISION Backend" cmd /c "cd backend && venv\Scripts\activate.bat && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

:: Wait a moment for backend to start
timeout /t 3 /nobreak > nul

:: Start frontend
cd frontend
call npm run dev

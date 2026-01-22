# SPINEVISION-AI Project

> AI-Based Spine Disease Detection Web Application

## 🏥 Project Overview

SPINEVISION-AI is a medical AI application that allows doctors to upload spine X-ray images and receive AI-assisted analysis, including:

- **Disease Probability Scores** - AI-powered detection of spine conditions
- **Visual Heatmaps** - Highlighting areas of concern
- **Downloadable Reports** - Professional PDF diagnostic reports
- **Upload History** - Complete record of all analyses

## 🏗️ Project Structure

```
SPINEVISION-AI/
├── backend/                  # FastAPI Python Backend
│   ├── app/
│   │   ├── api/             # API endpoints
│   │   ├── database/        # SQLAlchemy models
│   │   └── services/        # Business logic
│   ├── storage/             # File storage
│   └── requirements.txt
│
├── frontend/                 # (Coming Soon) React Frontend
│
└── README.md
```

## 🚀 Quick Start

### Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Access API docs at: http://localhost:8000/docs

## 📚 Documentation

- [Backend README](./backend/README.md) - Detailed backend documentation

## 👥 Team

Final Year Project by SPINEVISION-AI Team

## 📄 License

Academic Use Only

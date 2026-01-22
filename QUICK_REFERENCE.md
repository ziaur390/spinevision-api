# SPINEVISION-AI Quick Reference Card

> Fast commands and reference for development

---

## 🚀 Quick Start Commands

```bash
# Navigate to project
cd "c:\Users\ziaur\OneDrive\Desktop\final year project\SPINEVISION_AI\backend"

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload --port 8000

# Access API docs
# Open: http://localhost:8000/docs
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `app/main.py` | Application entry point |
| `app/config.py` | Settings & environment variables |
| `app/database/models.py` | Database table definitions |
| `app/api/auth.py` | Login/Register endpoints |
| `app/api/upload.py` | Image upload endpoint |
| `app/services/ml_service.py` | AI/ML inference logic |
| `app/services/report_service.py` | PDF generation |

---

## 🔌 API Endpoints Quick Reference

### Authentication
```
POST /auth/register     → Register user
POST /auth/login        → Get JWT token
GET  /auth/me           → Get current user
```

### Core Features
```
POST /upload            → Upload X-ray (multipart/form-data)
GET  /result/{id}       → Get analysis result
GET  /result/{id}/heatmap → Download heatmap image
GET  /result/{id}/report  → Download PDF report
GET  /history           → Get user's upload history
```

---

## 🔑 Authentication Header

```
Authorization: Bearer <your_token_here>
```

---

## 📊 Sample API Responses

### Login Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

### Analysis Result
```json
{
  "overall_classification": "Abnormal - High Confidence",
  "confidence_score": 0.87,
  "predictions": [
    {"label": "Disc Space Narrowing", "probability": 0.87},
    {"label": "Degenerative Changes", "probability": 0.63}
  ],
  "heatmap_url": "/storage/heatmaps/heatmap_xxx.png",
  "report_url": "/storage/reports/report_xxx.pdf"
}
```

---

## 🛠️ Common Commands

```bash
# Check running processes on port 8000
netstat -ano | findstr :8000

# Kill process by PID
taskkill /PID <pid> /F

# Freeze current dependencies
pip freeze > requirements.txt

# View installed packages
pip list

# Deactivate virtual environment
deactivate
```

---

## 🐛 Quick Fixes

| Problem | Solution |
|---------|----------|
| Module not found | Activate venv, reinstall deps |
| Port in use | Kill process on port 8000 |
| Token expired | Login again |
| CORS error | Check allow_origins in main.py |
| DB locked | Restart server |

---

## 📚 URLs

| URL | Description |
|-----|-------------|
| http://localhost:8000 | API Root |
| http://localhost:8000/docs | Swagger UI |
| http://localhost:8000/redoc | ReDoc |
| http://localhost:8000/health | Health Check |

---

*Keep this card handy for quick reference!*

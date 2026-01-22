# SPINEVISION-AI Development Guide

> Complete Documentation for Building and Running the AI-Based Spine Disease Detection System

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Architecture](#3-project-architecture)
4. [Backend Development Process](#4-backend-development-process)
5. [Database Design](#5-database-design)
6. [API Endpoints](#6-api-endpoints)
7. [Authentication System](#7-authentication-system)
8. [File Storage System](#8-file-storage-system)
9. [ML/AI Service](#9-mlai-service)
10. [PDF Report Generation](#10-pdf-report-generation)
11. [Installation Guide](#11-installation-guide)
12. [Running the Application](#12-running-the-application)
13. [Testing the API](#13-testing-the-api)
14. [Future Integration](#14-future-integration)
15. [Troubleshooting](#15-troubleshooting)

---

## 1. Project Overview

### What is SPINEVISION-AI?

SPINEVISION-AI is a web-based medical AI application designed for **Final Year Project (FYP)** purposes. It allows healthcare professionals (doctors) to:

1. **Upload** spine X-ray images (PNG, JPG, DICOM)
2. **Receive AI-assisted analysis** with disease probability scores
3. **View heatmap visualizations** highlighting areas of concern
4. **Download PDF diagnostic reports**
5. **Access complete upload history**

### Project Goals

- Create a prototype that demonstrates AI-assisted medical diagnosis
- Build a production-ready architecture that can scale
- Implement proper security with JWT authentication
- Design an easy-to-extend ML pipeline for future real model integration

### User Flow

```
User Registration → Login → Upload X-ray → AI Processing → View Results → Download Report
                                              ↓
                                    Access History Dashboard
```

---

## 2. Technology Stack

### Backend Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **Python** | Primary programming language | 3.9+ |
| **FastAPI** | Modern async web framework | 0.109+ |
| **SQLAlchemy** | ORM for database operations | 2.0+ |
| **SQLite** | Local development database | Built-in |
| **PostgreSQL** | Production database (optional) | 12+ |
| **Uvicorn** | ASGI server | 0.27+ |
| **Pydantic** | Data validation | 2.5+ |
| **python-jose** | JWT token generation | 3.3+ |
| **passlib + bcrypt** | Password hashing | 1.7+ |
| **Pillow** | Image processing | 10.2+ |
| **NumPy** | Numerical operations | 1.26+ |
| **ReportLab** | PDF generation | 4.0+ |

### Why These Technologies?

1. **FastAPI** - Chosen for:
   - Automatic API documentation (Swagger/OpenAPI)
   - Async support for handling file uploads
   - Type hints and validation with Pydantic
   - High performance comparable to Node.js

2. **SQLAlchemy** - Chosen for:
   - ORM pattern (cleaner code)
   - Database-agnostic (SQLite → PostgreSQL transition)
   - Relationship handling between tables

3. **JWT Authentication** - Chosen for:
   - Stateless authentication (scalable)
   - Standard approach for API security
   - Easy frontend integration

---

## 3. Project Architecture

### Folder Structure

```
SPINEVISION_AI/
├── backend/
│   ├── app/
│   │   ├── __init__.py           # Package initialization
│   │   ├── main.py               # FastAPI application entry point
│   │   ├── config.py             # Configuration and settings
│   │   │
│   │   ├── database/
│   │   │   ├── __init__.py       # Database package exports
│   │   │   ├── db.py             # Database connection setup
│   │   │   └── models.py         # SQLAlchemy ORM models
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py       # API router exports
│   │   │   ├── auth.py           # Authentication endpoints
│   │   │   ├── upload.py         # File upload endpoints
│   │   │   ├── result.py         # Result retrieval endpoints
│   │   │   └── history.py        # History endpoints
│   │   │
│   │   └── services/
│   │       ├── __init__.py       # Service exports
│   │       ├── storage_service.py # File storage operations
│   │       ├── ml_service.py     # AI/ML inference
│   │       └── report_service.py # PDF report generation
│   │
│   ├── storage/
│   │   ├── uploads/              # Uploaded X-ray images
│   │   ├── heatmaps/             # Generated heatmaps
│   │   └── reports/              # Generated PDF reports
│   │
│   ├── requirements.txt          # Python dependencies
│   ├── .gitignore               # Git ignore rules
│   └── README.md                # Backend documentation
│
├── frontend/                     # (Future) React frontend
├── README.md                    # Project overview
└── DEVELOPMENT_GUIDE.md         # This file
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                   │
│                    (React/Next.js - Future)                          │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │ HTTP/REST API
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND                               │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                     API LAYER (Routers)                      │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐    │    │
│  │  │  Auth    │ │  Upload  │ │  Result  │ │   History    │    │    │
│  │  │ Router   │ │  Router  │ │  Router  │ │   Router     │    │    │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘    │    │
│  └───────┼────────────┼────────────┼──────────────┼────────────┘    │
│          │            │            │              │                  │
│  ┌───────┴────────────┴────────────┴──────────────┴────────────┐    │
│  │                   SERVICE LAYER                              │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐     │    │
│  │  │   Storage    │ │     ML       │ │     Report       │     │    │
│  │  │   Service    │ │   Service    │ │     Service      │     │    │
│  │  └──────────────┘ └──────────────┘ └──────────────────┘     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                │                                     │
│  ┌─────────────────────────────┴───────────────────────────────┐    │
│  │                    DATABASE LAYER                            │    │
│  │         SQLAlchemy ORM → SQLite / PostgreSQL                 │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FILE STORAGE                                 │
│              /storage/uploads  /heatmaps  /reports                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Backend Development Process

### Step 1: Project Setup

We started by creating the project structure:

```bash
# Create main directories
mkdir -p backend/app/database
mkdir -p backend/app/api
mkdir -p backend/app/services
mkdir -p backend/storage/uploads
mkdir -p backend/storage/heatmaps
mkdir -p backend/storage/reports
```

### Step 2: Define Dependencies (requirements.txt)

```txt
# FastAPI and Server
fastapi>=0.109.0
uvicorn>=0.27.0
python-multipart>=0.0.6

# Database
sqlalchemy>=2.0.25
psycopg2-binary>=2.9.9

# Authentication
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4

# Configuration
python-dotenv>=1.0.0
pydantic[email]>=2.5.3
pydantic-settings>=2.1.0

# Image Processing
pillow>=10.2.0
numpy>=1.26.3

# PDF Generation
reportlab>=4.0.8

# Utilities
aiofiles>=23.2.1
```

### Step 3: Configuration Management (config.py)

We created a centralized configuration using Pydantic Settings:

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "SPINEVISION-AI"
    DATABASE_URL: str = "sqlite:///./spinevision.db"
    SECRET_KEY: str = "your-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    class Config:
        env_file = ".env"
```

**Key Design Decision:** Using environment variables allows easy configuration changes without code modifications.

### Step 4: Database Setup (database/db.py)

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Key Design Decision:** Using dependency injection (`get_db`) ensures proper database session handling.

### Step 5: Define Models (database/models.py)

We created three main models:

```python
class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    role = Column(Enum(UserRole), default=UserRole.DOCTOR)
    # ... relationships

class Upload(Base):
    __tablename__ = "uploads"
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"))
    file_path = Column(String(500))
    status = Column(Enum(UploadStatus))
    # ... relationships

class Result(Base):
    __tablename__ = "results"
    id = Column(String(36), primary_key=True)
    upload_id = Column(String(36), ForeignKey("uploads.id"))
    predictions = Column(JSON)
    heatmap_path = Column(String(500))
    report_path = Column(String(500))
```

**Key Design Decisions:**
- UUIDs for primary keys (security, no guessable IDs)
- JSON column for flexible prediction storage
- Status enum for tracking processing state

### Step 6: Create API Endpoints

Each router handles a specific domain:

- **auth.py** - Registration, login, user info
- **upload.py** - File upload and processing
- **result.py** - Result retrieval, heatmap, report download
- **history.py** - Upload history with pagination

### Step 7: Implement Services

Services contain business logic separate from API handlers:

- **storage_service.py** - File validation, saving, retrieval
- **ml_service.py** - AI inference (dummy for now)
- **report_service.py** - PDF generation

### Step 8: Main Application (main.py)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SPINEVISION-AI")

# Add CORS for frontend access
app.add_middleware(CORSMiddleware, allow_origins=["*"], ...)

# Mount static files
app.mount("/storage", StaticFiles(directory="storage"))

# Include routers
app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(result_router)
app.include_router(history_router)
```

---

## 5. Database Design

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                          USERS                               │
├─────────────────────────────────────────────────────────────┤
│ id (PK)        │ UUID                                        │
│ email          │ VARCHAR(255) UNIQUE                         │
│ hashed_password│ VARCHAR(255)                                │
│ full_name      │ VARCHAR(255)                                │
│ role           │ ENUM(doctor, admin)                         │
│ created_at     │ DATETIME                                    │
│ is_active      │ VARCHAR(5)                                  │
└───────────────────────────┬─────────────────────────────────┘
                            │ 1
                            │
                            │ N
┌───────────────────────────┴─────────────────────────────────┐
│                         UPLOADS                              │
├─────────────────────────────────────────────────────────────┤
│ id (PK)        │ UUID                                        │
│ user_id (FK)   │ UUID → USERS.id                            │
│ file_name      │ VARCHAR(255)                                │
│ file_path      │ VARCHAR(500)                                │
│ file_type      │ VARCHAR(50)                                 │
│ file_size      │ VARCHAR(20)                                 │
│ status         │ ENUM(uploaded, processing, done, failed)    │
│ created_at     │ DATETIME                                    │
└───────────────────────────┬─────────────────────────────────┘
                            │ 1
                            │
                            │ 1
┌───────────────────────────┴─────────────────────────────────┐
│                         RESULTS                              │
├─────────────────────────────────────────────────────────────┤
│ id (PK)        │ UUID                                        │
│ upload_id (FK) │ UUID → UPLOADS.id (UNIQUE)                 │
│ model_version  │ VARCHAR(50)                                 │
│ overall_class  │ VARCHAR(50)                                 │
│ predictions    │ JSON                                        │
│ confidence     │ VARCHAR(10)                                 │
│ heatmap_path   │ VARCHAR(500)                                │
│ report_path    │ VARCHAR(500)                                │
│ processed_at   │ DATETIME                                    │
└─────────────────────────────────────────────────────────────┘
```

### Relationships

- **User → Uploads**: One-to-Many (One user can have many uploads)
- **Upload → Result**: One-to-One (Each upload has exactly one result)

---

## 6. API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login and get token | No |
| GET | `/auth/me` | Get current user | Yes |
| POST | `/auth/logout` | Logout user | Yes |

### Upload Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/upload` | Upload X-ray image | Yes |
| GET | `/upload/{id}` | Get upload status | Yes |

### Result Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/result/{upload_id}` | Get analysis results | Yes |
| GET | `/result/{upload_id}/heatmap` | Download heatmap | Yes |
| GET | `/result/{upload_id}/report` | Download PDF report | Yes |

### History Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/history` | Get upload history | Yes |
| GET | `/history/statistics` | Get user stats | Yes |
| DELETE | `/history/{upload_id}` | Delete upload | Yes |

### Health Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Root health check | No |
| GET | `/health` | Detailed health | No |

---

## 7. Authentication System

### How JWT Authentication Works

```
┌─────────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION FLOW                          │
└─────────────────────────────────────────────────────────────────┘

1. REGISTRATION
   ┌──────────┐     POST /auth/register      ┌──────────┐
   │  Client  │ ─────────────────────────────▶│  Server  │
   │          │  {email, password, name}      │          │
   │          │                               │  Hash PW │
   │          │◀───────────────────────────── │ Save DB  │
   └──────────┘    {user data}                └──────────┘

2. LOGIN
   ┌──────────┐     POST /auth/login         ┌──────────┐
   │  Client  │ ─────────────────────────────▶│  Server  │
   │          │  {email, password}            │          │
   │          │                               │ Verify   │
   │          │◀───────────────────────────── │Create JWT│
   │  Store   │    {access_token, user}       └──────────┘
   │  Token   │
   └──────────┘

3. AUTHENTICATED REQUEST
   ┌──────────┐  GET /upload (+ Bearer Token) ┌──────────┐
   │  Client  │ ─────────────────────────────▶│  Server  │
   │          │  Authorization: Bearer xxx    │          │
   │          │                               │Verify JWT│
   │          │◀───────────────────────────── │ Process  │
   └──────────┘    {response data}            └──────────┘
```

### Password Security

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"])

# Hashing password
hashed = pwd_context.hash("plain_password")

# Verifying password
is_valid = pwd_context.verify("plain_password", hashed)
```

### JWT Token Structure

```json
{
  "sub": "user-uuid-here",
  "email": "doctor@example.com",
  "exp": 1705237200
}
```

---

## 8. File Storage System

### Storage Structure

```
storage/
├── uploads/
│   └── {user_id}/
│       └── 20240114_abc123_xray.png
├── heatmaps/
│   └── heatmap_{upload_id}.png
└── reports/
    └── report_{upload_id}.pdf
```

### File Naming Convention

```
{timestamp}_{unique_id}_{original_filename}

Example: 20240114_153045_a1b2c3d4_spine_lateral.png
```

### Allowed File Types

- PNG (image/png)
- JPG/JPEG (image/jpeg)
- DICOM (application/dicom)

### Maximum File Size

- 50 MB (configurable in config.py)

---

## 9. ML/AI Service

### Current Implementation (Dummy)

The ML service currently provides **placeholder predictions** that simulate real AI output:

```python
# Example dummy output
{
    "overall": "Abnormal - High Confidence",
    "model_version": "v0.1-dummy",
    "confidence_score": 0.87,
    "predictions": [
        {
            "label": "Disc Space Narrowing",
            "description": "Reduced space between vertebral discs",
            "probability": 0.87
        },
        {
            "label": "Degenerative Changes",
            "description": "Age-related wear of spinal structures",
            "probability": 0.63
        },
        {
            "label": "Spondylolisthesis",
            "description": "Forward displacement of vertebra",
            "probability": 0.12
        }
    ]
}
```

### Detectable Conditions

| Condition | Description |
|-----------|-------------|
| Disc Space Narrowing | Reduced space between vertebral discs |
| Degenerative Changes | Age-related wear and tear |
| Spondylolisthesis | Forward vertebra displacement |
| Osteophytes | Bone spurs along vertebral edges |
| Scoliosis | Abnormal lateral curvature |
| Vertebral Compression | Compression fracture |
| Spinal Stenosis | Narrowing of spinal canal |

### Heatmap Generation

Currently generates a **simulated heatmap** overlay:
- Red/orange highlights on the original image
- Marks "regions of interest"
- Designed to be replaced with Grad-CAM visualizations

---

## 10. PDF Report Generation

### Report Structure

```
┌─────────────────────────────────────────────────────────────┐
│                      SPINEVISION-AI                          │
│         AI-Assisted Spine Disease Detection Report           │
├─────────────────────────────────────────────────────────────┤
│ Report Generated: January 14, 2024 at 15:00                  │
│ Requesting Physician: Dr. Smith                              │
├─────────────────────────────────────────────────────────────┤
│                  OVERALL CLASSIFICATION                      │
│  ┌─────────────────────────────────────────┐                │
│  │   ABNORMAL - HIGH CONFIDENCE            │ (Red Box)      │
│  │   Confidence: 87%                       │                │
│  └─────────────────────────────────────────┘                │
├─────────────────────────────────────────────────────────────┤
│                   DETECTED CONDITIONS                        │
│                                                              │
│  | Condition              | Probability | Severity |        │
│  |------------------------|-------------|----------|        │
│  | Disc Space Narrowing   | 87%         | High     |        │
│  | Degenerative Changes   | 63%         | Moderate |        │
│  | Spondylolisthesis      | 12%         | Very Low |        │
├─────────────────────────────────────────────────────────────┤
│                   HEATMAP VISUALIZATION                      │
│                      [Image Here]                            │
├─────────────────────────────────────────────────────────────┤
│                    RECOMMENDATIONS                           │
│                                                              │
│  1. Immediate consultation with orthopedic specialist        │
│  2. Additional imaging studies (MRI) recommended             │
│  3. Clinical correlation with symptoms essential             │
├─────────────────────────────────────────────────────────────┤
│                      DISCLAIMER                              │
│  This report is for clinical decision support only...        │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. Installation Guide

### Prerequisites

- **Python 3.9+** (Download from python.org)
- **Git** (For cloning repository)
- **pip** (Python package manager)

### Step-by-Step Installation

```bash
# 1. Clone the repository
git clone git@github.com:ziaur390/SPINEVISION-AI.git
cd SPINEVISION-AI

# 2. Navigate to backend folder
cd backend

# 3. Create virtual environment
python -m venv venv

# 4. Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Windows CMD:
.\venv\Scripts\activate.bat

# Linux/Mac:
source venv/bin/activate

# 5. Install dependencies
pip install -r requirements.txt

# 6. (Optional) Create .env file for custom configuration
echo "SECRET_KEY=your-super-secret-key-here" > .env
echo "DEBUG=true" >> .env
```

### Verify Installation

```bash
# Check Python version
python --version  # Should be 3.9+

# Check installed packages
pip list | grep fastapi
pip list | grep sqlalchemy
```

---

## 12. Running the Application

### Development Mode (with auto-reload)

```bash
cd backend
.\venv\Scripts\Activate.ps1  # Activate venv (Windows)
uvicorn app.main:app --reload --port 8000
```

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Expected Output

```
==================================================
🦴 SPINEVISION-AI Backend Starting...
==================================================
✓ Directory ready: .../storage
✓ Directory ready: .../storage/uploads
✓ Directory ready: .../storage/heatmaps
✓ Directory ready: .../storage/reports
✓ ML Service initialized (Model Version: v0.1-dummy)
✓ Database tables created successfully

✅ Backend ready!
📍 API Docs: http://localhost:8000/docs
📍 ReDoc: http://localhost:8000/redoc
==================================================

INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Access Points

| URL | Description |
|-----|-------------|
| http://localhost:8000 | API Root |
| http://localhost:8000/docs | Swagger UI Documentation |
| http://localhost:8000/redoc | ReDoc Documentation |
| http://localhost:8000/health | Health Check |

---

## 13. Testing the API

### Using Swagger UI (Recommended)

1. Open http://localhost:8000/docs
2. Click on an endpoint to expand it
3. Click "Try it out"
4. Fill in the parameters
5. Click "Execute"

### Using cURL

#### Register a User
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@example.com",
    "password": "password123",
    "full_name": "Dr. John Smith"
  }'
```

#### Login
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=doctor@example.com&password=password123"
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

#### Upload an X-ray
```bash
curl -X POST "http://localhost:8000/upload" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/xray.png"
```

#### Get Results
```bash
curl -X GET "http://localhost:8000/result/UPLOAD_ID_HERE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Get History
```bash
curl -X GET "http://localhost:8000/history" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Python

```python
import requests

BASE_URL = "http://localhost:8000"

# Register
response = requests.post(f"{BASE_URL}/auth/register", json={
    "email": "doctor@example.com",
    "password": "password123",
    "full_name": "Dr. Smith"
})
print(response.json())

# Login
response = requests.post(f"{BASE_URL}/auth/login", data={
    "username": "doctor@example.com",
    "password": "password123"
})
token = response.json()["access_token"]

# Upload
headers = {"Authorization": f"Bearer {token}"}
with open("xray.png", "rb") as f:
    response = requests.post(
        f"{BASE_URL}/upload",
        headers=headers,
        files={"file": f}
    )
print(response.json())
```

---

## 14. Future Integration

### Integrating a Real PyTorch Model

1. **Install PyTorch**
   ```bash
   pip install torch torchvision
   ```

2. **Place your model file**
   ```
   backend/models/spine_classifier.pt
   ```

3. **Update ml_service.py**

   ```python
   import torch
   from torchvision import transforms
   
   class MLService:
       def _load_model(self):
           self.model = torch.load('models/spine_classifier.pt')
           self.model.eval()
           self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
           self.model = self.model.to(self.device)
       
       def _preprocess_image(self, image_path):
           transform = transforms.Compose([
               transforms.Resize((224, 224)),
               transforms.ToTensor(),
               transforms.Normalize(mean=[0.485], std=[0.229])
           ])
           image = Image.open(image_path).convert('L')
           return transform(image).unsqueeze(0).to(self.device)
       
       async def analyze_xray(self, image_path, upload_id):
           preprocessed = self._preprocess_image(image_path)
           
           with torch.no_grad():
               outputs = self.model(preprocessed)
               probabilities = torch.softmax(outputs, dim=1)
           
           # Convert to predictions format
           predictions = self._format_predictions(probabilities)
           
           return {
               "overall": self._classify(predictions),
               "predictions": predictions,
               # ...
           }
   ```

4. **For Grad-CAM Heatmaps**
   ```bash
   pip install pytorch-grad-cam
   ```

   ```python
   from pytorch_grad_cam import GradCAM
   from pytorch_grad_cam.utils.image import show_cam_on_image
   
   cam = GradCAM(model=model, target_layers=[model.layer4[-1]])
   grayscale_cam = cam(input_tensor=input_tensor)
   visualization = show_cam_on_image(rgb_img, grayscale_cam)
   ```

### Adding PostgreSQL Support

1. **Install driver**
   ```bash
   pip install psycopg2-binary
   ```

2. **Update .env**
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/spinevision
   ```

3. **Create database**
   ```sql
   CREATE DATABASE spinevision;
   ```

---

## 15. Troubleshooting

### Common Issues

#### 1. "No module named 'xxx'"
```bash
# Ensure virtual environment is activated
.\venv\Scripts\Activate.ps1

# Reinstall dependencies
pip install -r requirements.txt
```

#### 2. Port already in use
```bash
# Find and kill process on port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :8000
kill -9 <PID>
```

#### 3. Database locked (SQLite)
```bash
# Restart the server
# Or delete the database file and restart
del spinevision.db
```

#### 4. CORS errors (from frontend)
Ensure CORS is configured in main.py:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 5. JWT Token expired
- Tokens expire after 24 hours
- Login again to get a new token

### Getting Help

1. Check the API documentation at `/docs`
2. Review server logs for error messages
3. Ensure all dependencies are installed correctly

---

## 📝 Summary

This guide covered:

1. ✅ Project structure and architecture
2. ✅ Technology choices and justifications
3. ✅ Database design and relationships
4. ✅ Authentication flow with JWT
5. ✅ File storage system
6. ✅ ML service (dummy implementation)
7. ✅ PDF report generation
8. ✅ Complete API documentation
9. ✅ Installation and running instructions
10. ✅ Testing examples
11. ✅ Future integration path for real ML models
12. ✅ Troubleshooting guide

---

**Document Version:** 1.0  
**Last Updated:** January 14, 2024  
**Project:** SPINEVISION-AI (Final Year Project)

---

*For additional support or questions, refer to the project repository or contact the development team.*

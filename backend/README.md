# SPINEVISION-AI Backend

> AI-Based Spine Disease Detection Web Application

## 🏥 Overview

SPINEVISION-AI is a medical AI application that allows doctors to upload spine X-ray images and receive AI-assisted analysis, including:

- Disease probability scores
- Visual heatmaps highlighting areas of concern
- Downloadable PDF diagnostic reports
- Complete upload and analysis history

## 🛠 Technology Stack

- **Framework**: FastAPI (Python)
- **Database**: SQLAlchemy ORM with SQLite (PostgreSQL supported)
- **Authentication**: JWT-based with bcrypt password hashing
- **Server**: Uvicorn ASGI
- **PDF Generation**: ReportLab
- **Image Processing**: Pillow, NumPy

## 📁 Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration and settings
│   │
│   ├── database/
│   │   ├── db.py            # Database connection
│   │   └── models.py        # SQLAlchemy models
│   │
│   ├── api/
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── upload.py        # Image upload endpoints
│   │   ├── result.py        # Result retrieval endpoints
│   │   └── history.py       # History endpoints
│   │
│   └── services/
│       ├── storage_service.py  # File storage handling
│       ├── ml_service.py       # AI/ML inference (dummy)
│       └── report_service.py   # PDF report generation
│
├── storage/
│   ├── uploads/             # Uploaded X-ray images
│   ├── heatmaps/            # Generated heatmaps
│   └── reports/             # Generated PDF reports
│
├── requirements.txt
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Python 3.9 or higher
- pip (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:ziaur390/SPINEVISION-AI.git
   cd SPINEVISION-AI/backend
   ```

2. **Create a virtual environment** (recommended)
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the server**
   ```bash
   uvicorn app.main:app --reload
   ```

5. **Access the API**
   - API Documentation: http://localhost:8000/docs
   - Alternative Docs: http://localhost:8000/redoc

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and get JWT token |
| GET | `/auth/me` | Get current user info |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload X-ray image for analysis |
| GET | `/upload/{id}` | Get upload status |

### Results
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/result/{upload_id}` | Get analysis results |
| GET | `/result/{upload_id}/heatmap` | Download heatmap |
| GET | `/result/{upload_id}/report` | Download PDF report |

### History
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/history` | Get upload history |
| GET | `/history/statistics` | Get user statistics |
| DELETE | `/history/{upload_id}` | Delete an upload |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. Register or login to get an access token
2. Include the token in the Authorization header:
   ```
   Authorization: Bearer <your_token>
   ```

## 🧠 ML Model Integration

The current implementation uses a **dummy ML model** that generates realistic predictions. To integrate a real PyTorch model:

1. Place your trained model at `backend/models/spine_classifier.pt`

2. Update `app/services/ml_service.py`:
   - Modify `_load_model()` to load your PyTorch model
   - Update `_preprocess_image()` for your model's input requirements
   - Replace dummy predictions with actual model inference

3. See the detailed integration notes at the bottom of `ml_service.py`

### Dummy Model Output Format
```json
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
      "probability": 0.63
    }
  ],
  "heatmap_path": "storage/heatmaps/heatmap_xxx.png"
}
```

## ⚙️ Configuration

Environment variables (create a `.env` file):

```env
# Database (SQLite default, or PostgreSQL)
DATABASE_URL=sqlite:///./spinevision.db
# DATABASE_URL=postgresql://user:pass@localhost:5432/spinevision

# JWT Configuration
SECRET_KEY=your-super-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Server
DEBUG=true
PORT=8000
```

## 🧪 Testing the API

### Using cURL

**Register a user:**
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "doctor@example.com", "password": "password123", "full_name": "Dr. Smith"}'
```

**Login:**
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=doctor@example.com&password=password123"
```

**Upload an X-ray:**
```bash
curl -X POST "http://localhost:8000/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/xray.png"
```

## 📋 Database Schema

### User Table
- `id` (UUID, Primary Key)
- `email` (Unique, Indexed)
- `hashed_password`
- `full_name`
- `role` (doctor/admin)
- `created_at`
- `is_active`

### Upload Table
- `id` (UUID, Primary Key)
- `user_id` (Foreign Key → User)
- `file_name`, `file_path`, `file_type`, `file_size`
- `status` (uploaded/processing/done/failed)
- `created_at`

### Result Table
- `id` (UUID, Primary Key)
- `upload_id` (Foreign Key → Upload)
- `model_version`
- `overall_classification`
- `predictions` (JSON)
- `confidence_score`
- `heatmap_path`, `report_path`
- `processed_at`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is developed as a Final Year Project for academic purposes.

---

**SPINEVISION-AI** - Making spine diagnostics smarter with AI 🦴✨

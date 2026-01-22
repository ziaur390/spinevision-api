# SPINEVISION-AI Frontend Guide

> Complete guide for the React frontend application

---

## 🚀 Quick Start

### Step 1: Navigate to Frontend
```bash
cd "c:\Users\ziaur\OneDrive\Desktop\final year project\SPINEVISION_AI\frontend"
```

### Step 2: Install Dependencies (if not done)
```bash
npm install
```

### Step 3: Start the Frontend
```bash
npm run dev
```

### Step 4: Open in Browser
```
http://localhost:3000
```

---

## 🔐 How to Login

### First Time? Register a New Account

1. Go to **http://localhost:3000/register**
2. Fill in:
   - **Full Name**: Dr. Your Name
   - **Email**: your.email@hospital.com
   - **Password**: (minimum 6 characters)
   - **Confirm Password**: (same as above)
3. Click **"Create Account"**
4. You'll be redirected to the login page

### Already Registered? Login

1. Go to **http://localhost:3000/login**
2. Enter your email and password
3. Click **"Sign In"**
4. You'll be redirected to the Dashboard

---

## 📱 Pages Overview

### 1. Login Page (`/login`)
- Clean, split-screen design
- Email and password authentication
- Link to registration page

### 2. Register Page (`/register`)
- Create new user account
- Full name, email, password fields
- Password confirmation

### 3. Dashboard (`/dashboard`)
- Welcome message with greeting
- Statistics cards (Total Scans, Normal, Abnormal, Processing)
- Quick action cards (Upload, History)
- Recent scans list
- AI model info

### 4. Upload Page (`/upload`)
- Drag & drop zone for X-ray images
- File preview with image thumbnail
- Upload progress bar
- Supported formats: PNG, JPG, DICOM
- Max file size: 50MB

### 5. Result Page (`/result/:id`)
- Overall classification (Normal/Abnormal)
- Confidence score percentage
- List of detected conditions with probabilities
- Color-coded risk levels
- Heatmap visualization
- Download PDF report button
- Disclaimer for medical use

### 6. History Page (`/history`)
- Table of all previous scans
- File name, date, status, result
- View result button for each scan
- Delete scan option
- Pagination controls

---

## 🎨 Design Features

### Professional Medical Theme
- **Primary Color**: Teal (#0f766e)
- **Secondary Color**: Cyan (#06b6d4)
- **Background**: Light gray (#f8fafc)
- **Cards**: White with subtle shadows

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 400, 500, 600, 700

### UI Elements
- Rounded corners (xl, 2xl)
- Soft shadows
- Gradient buttons
- Smooth animations
- Hover effects

---

## 🔌 Backend Connection

The frontend connects to the backend at:
```
http://localhost:8000
```

### Required Backend Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/register` | POST | Register new user |
| `/auth/login` | POST | Login and get token |
| `/auth/me` | GET | Get current user |
| `/upload` | POST | Upload X-ray |
| `/result/{id}` | GET | Get analysis result |
| `/result/{id}/report` | GET | Download PDF |
| `/history` | GET | Get scan history |
| `/history/statistics` | GET | Get stats |
| `/history/{id}` | DELETE | Delete scan |

---

## 📁 File Structure

```
frontend/
├── src/
│   ├── assets/
│   │   └── logo.png              # Project logo
│   │
│   ├── components/
│   │   ├── Navbar.jsx            # Top navigation
│   │   ├── Sidebar.jsx           # Side navigation
│   │   └── ProtectedRoute.jsx    # Auth guard
│   │
│   ├── pages/
│   │   ├── Login.jsx             # Login page
│   │   ├── Register.jsx          # Registration page
│   │   ├── Dashboard.jsx         # Main dashboard
│   │   ├── Upload.jsx            # File upload
│   │   ├── Processing.jsx        # Loading state
│   │   ├── Result.jsx            # Results view
│   │   └── History.jsx           # Upload history
│   │
│   ├── services/
│   │   └── api.js                # API client
│   │
│   ├── App.jsx                   # Router config
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Tailwind styles
│
├── public/
│   └── logo.png                  # Favicon
│
├── index.html                    # HTML template
├── vite.config.js               # Vite configuration
├── package.json                 # Dependencies
└── README.md                    # Documentation
```

---

## 🧪 Testing Flow

### Complete Test Scenario

1. **Register** at http://localhost:3000/register
   - Name: Dr. Test User
   - Email: test@hospital.com
   - Password: test123

2. **Login** at http://localhost:3000/login
   - Use the credentials you just created

3. **View Dashboard**
   - See welcome message
   - Check statistics (initially 0)

4. **Upload X-ray**
   - Click "Upload X-ray" in sidebar
   - Drag and drop any PNG/JPG image
   - Click "Start AI Analysis"

5. **View Results**
   - See classification result
   - View detected conditions
   - Click "Download PDF Report"

6. **Check History**
   - Click "History" in sidebar
   - See your uploaded scan
   - Click eye icon to view result again

---

## 🛠️ Troubleshooting

### "Network Error" or "Failed to fetch"
- Make sure backend is running on port 8000
- Check: http://localhost:8000/health

### "Login failed"
- Verify email and password are correct
- Try registering a new account

### Images not loading
- Ensure storage folder permissions are correct
- Check browser console for CORS errors

### Styles not applying
- Run `npm install` again
- Clear browser cache
- Restart dev server

---

## 📋 NPM Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 🎯 Key Features

✅ **Professional UI** - Medical-grade design  
✅ **Responsive** - Works on all screen sizes  
✅ **Secure** - JWT authentication  
✅ **Fast** - Vite bundler for quick loading  
✅ **User-friendly** - Intuitive navigation  
✅ **Complete** - All features implemented  

---

## 📞 Quick Reference

| What | Where |
|------|-------|
| Frontend | http://localhost:3000 |
| Register | http://localhost:3000/register |
| Login | http://localhost:3000/login |
| Dashboard | http://localhost:3000/dashboard |
| Upload | http://localhost:3000/upload |
| History | http://localhost:3000/history |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

---

**Frontend Version**: 1.0  
**Last Updated**: January 2024  
**Project**: SPINEVISION-AI (Final Year Project)

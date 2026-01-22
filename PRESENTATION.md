---
marp: true
theme: default
paginate: true
---

# SPINEVISION-AI
## AI-Based Spine Disease Detection & Analysis

**Final Year Project (FYP-I) Progress Presentation**

---

## 👥 Team & Supervisor

**Group Members:**
1.  **Imad Ud Din**
2.  **Hammad Ali Khan**
3.  **Zia Ur Rahman**

**Supervisor:**
*   **Dr. Suhaib Qureshi**

---

## 📌 Problem Statement

*   **Manual Diagnosis:** Analyzing spine X-rays is time-consuming and prone to human error.
*   **Complexity:** Subtle conditions (e.g., early disc narrowing) can be missed.
*   **Resource Gap:** Shortage of expert radiologists leads to delayed reports.

**Our Solution:**
An automated, AI-powered web application that assists doctors by detecting spinal diseases and visualizing affected areas.

---

## 🎯 Objectives

1.  **Automated Detection:** Classify multiple spinal conditions (e.g., Spondylolisthesis, Disc Narrowing) from X-ray images.
2.  **Visual Explanations:** Generate heatmaps to show *where* the AI detected the issue (Explainable AI).
3.  **Report Generation:** Automatically generate professional PDF diagnostic reports.
4.  **User Management:** Secure portal for doctors to manage patient history.

---

## 🛠️ Methodology & Tech Stack

**Architecture:**
*   **Frontend:** React.js (User Interface)
*   **Backend:** FastAPI (Python)
*   **AI Engine:** PyTorch / TensorFlow
*   **Database:** SQLite / PostgreSQL

**Workflow:**
1.  Doctor logs in & uploads X-ray.
2.  Backend pre-processes image.
3.  AI Model analyzes & generates probability scores.
4.  System generates heatmap & PDF report.
5.  Doctor reviews & downloads results.

---

## 📊 Current Progress (FYP-I Status)

### 1. **Backend Development (Completed)**
*   ✅ **FastAPI Server:** Fully operational.
*   ✅ **Authentication:** Secure Login/Register (JWT).
*   ✅ **File Handling:** Upload/Storage system customized for medical images.
*   ✅ **Reporting Module:** PDF generation engine integrated.

### 2. **Dataset & ML Model (In Progress)**
*   🔄 **Data Collection:** Currently curating a dataset of labeled spine X-rays (RSNA/MURA datasets).
*   🔄 **Preprocessing:** Implementing contrast enhancement and resizing pipelines.
*   🔄 **Model Implementation:** defining initial CNN architecture for classification.

### 3. **Frontend (Initial Setup)**
*   ✅ **Environment:** React + Vite project initialized.
*   ✅ **Design:** Minimalist Blue/Indigo medical theme selected.

---

## 🖼️ System Demo (Backend Capabilities)

*(Speaker Note: You can explain these features as "Ready" and "Tested")*

*   **Secure API:** All endpoints are protected and tested via Swagger UI.
*   **Upload Pipeline:** formatting checks (DICOM/PNG) implemented.
*   **History Tracking:** Database creates logs for every analysis.

---

## 📅 Future Work (FYP-II Plan)

1.  **Train Final Model:** Achieve high accuracy (>90%) on the custom dataset.
2.  **Frontend Integration:** Connect the React UI to the Python Backend.
3.  **Deployment:** Host the application on a cloud platform.
4.  **Testing:** Clinical validation with real X-ray samples.

---

## 🔚 Conclusion

*   **SPINEVISION-AI** is on track to provide a valuable tool for radiologists.
*   **Foundation laid:** Robust backend and architecture are ready.
*   **Next Focus:** Intensive ML training and UI development.

---

## ❓ Q & A

**Thank You!**

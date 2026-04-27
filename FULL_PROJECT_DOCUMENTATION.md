# SPINEVISION-AI: Comprehensive System Documentation

**Version:** 1.0  
**Last Updated:** January 2026  
**Authors:** Imad Ud Din, Hammad Ali Khan, Zia Ur Rahman  
**Supervisor:** Dr. Suhaib Qureshi

---

## 1. Executive Summary

**SPINEVISION-AI** is an advanced medical diagnostic support system designed to assist radiologists in the detection and analysis of spinal diseases from X-ray images. The project addresses the critical shortage of expert radiologists and the high subjectivity in manual X-ray interpretation.

By leveraging state-of-the-art Deep Learning models (U-Net and DenseNet) and Retrieval-Augmented Generation (RAG) for reporting, the system provides:
1.  **Automated Disease Classification**: Detecting conditions like Spondylolisthesis and Disc Narrowing.
2.  **Visual Explainability**: Generating heatmaps to show "where" the model is looking.
3.  **Automated Reporting**: Producing professional PDF reports with clinical context.

---

## 2. System Architecture

The application follows a modern, decoupled **Client-Server Architecture**.

### 2.1 Technology Stack & Rationale

| Layer | Technology | Why This Choice? |
| :--- | :--- | :--- |
| **Frontend** | **React.js + Vite** | • **Component-Based:** Modular UI pieces (buttons, forms) are reusable.<br>• **Virtual DOM:** Fast rendering for smooth user dashboards.<br>• **Vite:** Extremely fast build times compared to older tools like Webpack. |
| **Backend** | **FastAPI (Python)** | • **AsyncIO:** Handles multiple file uploads simultaneously without blocking.<br>• **Python Ecosystem:** Native integration with PyTorch/TensorFlow for ML.<br>• **Auto-Docs:** Automatically generates Swagger documentation. |
| **Database** | **SQLite / PostgreSQL** | • **Relational Integrity:** Essential for linking Users → Uploads → Reports securely.<br>• **SQLAlchemy ORM:** Allows switching databases (Dev vs. Prod) without code changes. |
| **Deployment** | **Docker** | • **Consistency:** "Works on my machine" guarantees it works on the cloud.<br>• **Isolation:** Separates app dependencies from the host OS. |

### 2.2 High-Level Data Flow

1.  **Client (React)** sends an image via API (`POST /upload`).
2.  **FastAPI Server** validates the file (DICOM/PNG check) and saves it to secure storage.
3.  **ML Service** is triggered:
    *   Image is preprocessed (normalized, resized).
    *   **U-Net** segments the spine.
    *   **DenseNet** classifies the disease.
4.  **Reporting Service** (RAG) compiles the findings into a structured report.
5.  **Database** updates the record with results and file paths.
6.  **Client** polls for status and displays the result when ready.

---

## 3. Artificial Intelligence Core (The "Brain")

This section details the ML models used, **why** they were chosen, and **how** they work together.

### 3.1 U-Net: The Segmenter

*   **Role:** To identify and isolate the specific Region of Interest (ROI)—the 33 vertebrae of the spine—from the background noise (ribs, organs).
*   **Why U-Net?**
    *   Originally designed for biomedical image fragmentation.
    *   Its "U" shape allows it to capture *context* (via down-sampling path) and *precise localization* (via up-sampling path).
    *   It works exceptionally well even with smaller datasets.
*   **How it works:** It takes the raw X-ray and outputs a "mask" (a binary image where white = spine, black = background). This ensures the classification model only looks at the spine.

### 3.2 DenseNet-121: The Classifier

*   **Role:** To diagnose the condition (e.g., "Normal", "Spondylolisthesis", "Scoliosis") based on the segmented spine image.
*   **Why DenseNet?**
    *   **Feature Reuse:** Each layer receives inputs from all preceding layers. This strengthens feature propagation and encourages feature reuse.
    *   **Parameter Efficiency:** It achieves high accuracy with fewer parameters than ResNet, reducing the computational load (important for web deployment).
    *   **Vanishing Gradient Solution:** The direct connections make it easier to train deep networks effectively.

### 3.3 RAG (Retrieval-Augmented Generation): The Reporter

*   **Role:** To generate the text for the diagnostic report.
*   **The Problem with Standard LLMs:** A standard LLM (like GPT) might "hallucinate" medical facts or invent symptoms not present in the image.
*   **The RAG Solution:**
    1.  The system takes the **classification output** (e.g., "Spondylolisthesis: Probability 85%").
    2.  It **retrieves** verified medical definitions and standard recommendation templates from a strictly curated internal medical knowledge base.
    3.  It **augments** the prompt to the LLM with this retrieved facts.
    4.  **Result:** The generated report is factually grounded and follows standard radiological reporting formats.

### 3.4 Handling Data Imbalance

A major challenge in medical AI is that "Normal" cases vastly outnumber "Disease" cases.
*   **Problem:** If 90% of data is "Normal", a model that always guesses "Normal" has 90% accuracy but is useless.
*   **Our Solutions:**
    1.  **Data Augmentation:** We artificially create new "Disease" samples by rotating, flipping, and adjusting the contrast of existing disease images.
    2.  **Weighted Loss Functions:** During training, we tell the model that making a mistake on a "Disease" image is 10x worse than making a mistake on a "Normal" image. This forces it to pay attention to rare classes.

---

## 4. Key Workflows

### 4.1 Authentication & Security
*   **JWT (JSON Web Tokens):** We use stateless authentication.
    *   User logs in → Server verifies password (hashed with **BCrypt**) → Server signs a JWT.
    *   Client stores JWT.
    *   Every subsequent request includes the JWT in the header (`Authorization: Bearer <token>`).
    *   Server decodes the token to identify the user. No session is stored on the server RAM.

### 4.2 The Analysis Pipeline
1.  **Ingestion:** Image is converted to grayscale and resized to 224x224 pixels.
2.  **Normalization:** Pixel intensity values are scaled to a 0-1 range to match the model's training data.
3.  **Inference:**
    *   Pass through Model A (U-Net) -> Get Mask.
    *   Apply Mask -> Get Clean Spine.
    *   Pass Clean Spine through Model B (DenseNet) -> Get Probabilities.
4.  **Heatmap Generation (Grad-CAM):** We compute the gradients of the target class score with respect to the feature maps of the final convolutional layer. This highlights the regions in the input image that were most important for the prediction.

---

## 5. Deployment Strategy

The application is containerized to ensure it runs everywhere.

*   **Docker Container 1 (Backend):** Contains Python 3.9, PyTorch, FastAPI, and all ML libraries.
*   **Docker Container 2 (Frontend):** Nginx server serving the static React build files.
*   **Orchestration:** `docker-compose` is used to spin up both containers and a shared network, allowing them to communicate.

---

## 6. Future Roadmap

1.  **Federated Learning:** To allow training on data from multiple hospitals without the data ever leaving their secure servers (privacy-preserving AI).
2.  **3D Reconstruction:** Using multiple X-ray angles (AP and Lateral views) to reconstruct a 3D model of the spine.
3.  **Mobile App:** Creating a React Native version for doctors on the go.

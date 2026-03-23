🚆 Rail Madad – AI Powered Complaint Management System

An intelligent complaint management system designed to enhance the existing Rail Madad platform using AI, image processing, and real-time metadata.

This project enables passengers to submit complaints using images, which are automatically analyzed and categorized using a deep learning model, improving response time and efficiency.

🌟 Features
📸 Image-based Complaint Submission
🤖 AI Classification (Vision-Language Model)
📍 Automatic GPS Location Capture
🕒 Timestamp Extraction (EXIF + fallback)
🔍 OCR Text Extraction from Images
🗺️ Live Map Integration (Leaflet.js)
⚡ Real-time Complaint Processing API
🧠 Smart Categorization (cleanliness, electrical, infrastructure issues, etc.)
🧠 How It Works
User uploads an image complaint
System extracts:
Timestamp (EXIF)
GPS location
Image is sent to backend API
AI model classifies complaint category
OCR extracts text (if any)
Complaint is stored in database
Response is returned with:
Category
Confidence
Location
Image URL
🏗️ Tech Stack
Frontend
Next.js (v0 based UI)
HTML, CSS, JavaScript
Leaflet.js (Map integration)
Backend
Flask API
SQLite Database
AI / ML
Qwen2-VL Vision Language Model
PyTorch
Transformers
Other Tools
Tesseract OCR
Geopy (Reverse Geocoding)
EXIF.js
📁 Project Structure
Rail_Madad/
│── app/ (Next.js frontend)
│── templates/
│   └── index.html (Image upload UI)
│── uploads/ (Stored complaint images)
│── model.py (AI classification logic)
│── app.py (Flask backend)
│── complaints.db (Database)
│── requirements.txt
🚀 Getting Started
🔹 Frontend (Next.js)
npm install
npm run dev

Open 👉 http://localhost:3000

🔹 Backend (Flask)
pip install -r requirements.txt
python app.py

Backend runs on 👉 http://127.0.0.1:5000

📡 API Endpoint
POST /api/upload

Form Data:

image → complaint image
lat → latitude (optional)
lon → longitude (optional)
timestamp → image timestamp

Response:

{
  "predicted_category": "dirty toilet",
  "confidence": 92,
  "place": "Bangalore, India",
  "ocr_text": "...",
  "image_url": "/uploads/file.jpg"
}
🧪 AI Categories

The model classifies complaints into categories like:

Dirty Toilet
Broken Socket
Fan Not Working
Overcrowded Coach
Water Leakage
Torn Seat
Broken Window
Cleanliness Issue
Electrical Issue
🎯 Project Objective

To automate railway complaint management by:

Reducing manual workload
Improving classification accuracy
Enabling faster complaint resolution
Providing better passenger experience

As highlighted in the project report, the system improves efficiency, transparency, and prioritization in grievance handling.

🔮 Future Enhancements
📊 Admin Dashboard with analytics
🔥 Heatmaps for complaint density
☁️ Cloud deployment (AWS / Render)
📱 Mobile app integration
🎥 Video-based complaint support
👨‍💻 Team
C H Prabhu Kishor
Harshan Gowda K S
Pothula Bharath
Sachin
📜 License

This project is for academic and research purposes.

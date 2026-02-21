# 🛍️ NearU — Smart Nearby Shop Locator with ML Ranking

## 📌 Project Overview

ShopMart3 is a location-based smart shop discovery platform that allows users to:

* 📍 Find nearby shops using Google Maps
* 🛒 Search products across multiple categories
* 🧠 Get ML-based ranked results
* 🚚 Calculate delivery time & cost based on distance
* ⭐ Compare shops based on rating, quality & price

The system integrates:

* Frontend (HTML, CSS, JS + Google Maps API)
* Backend (FastAPI)
* ML-based scoring system
* Dummy structured shop database

---

## 🚀 Features

### ✅ 1. Google Maps Integration

* User location detection
* Nearby shops displayed as markers
* Distance-based calculations
* Route rendering

### ✅ 2. Smart Product Search

* Category-based filtering
* Multi-shop comparison
* Stock availability check

### ✅ 3. ML-Based Ranking

Shops are ranked based on:

* Distance
* Rating
* Product quality
* Price
* Delivery fee

### ✅ 4. Delivery Cost Calculation

Delivery fee depends on:

* Distance from user
* Shop category
* Base shop fee

---

## 🧠 ML Logic Used

The system uses a weighted scoring model:

```
Score = 
(0.35 × Distance Score) +
(0.25 × Rating Score) +
(0.20 × Price Score) +
(0.10 × Quality Score) +
(0.10 × Delivery Fee Score)
```

Higher score = Better recommendation

---

## 🏗️ Project Structure

```
NearU
│
├── frontend
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── ml_service
│   ├── main.py
│   ├── train_model.py
│   ├── requirements.txt
│   └── models/
│
└── README.md
```

---

## ⚙️ Tech Stack

| Layer    | Technology Used                |
| -------- | ------------------------------ |
| Frontend | HTML, CSS, JavaScript          |
| Maps API | Google Maps JavaScript API     |
| Backend  | FastAPI                        |
| ML Logic | Python                         |
| Data     | Structured Dummy JSON Database |

---

## 📍 Current Demo Location

Shops are configured near:

📌 Priyadarshini College of Engineering
Hingna, Nagpur, Maharashtra
Coordinates: `21.1031, 78.0060`

---

## 🛠️ Installation & Setup

### 1️⃣ Clone Project

```
git clone <your-repo-link>
cd shopmart3
```

### 2️⃣ Setup Backend

```
cd ml_service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Server runs at:

```
http://127.0.0.1:8000
```

---

### 3️⃣ Run Frontend

Open:

```
frontend/index.html
```

Make sure Google Maps API key is added inside `app.js`.

---

## 🔍 API Endpoint

### POST `/search`

Request Body:

```json
{
  "query": "milk",
  "user_lat": 21.1031,
  "user_lng": 78.0060
}
```

Response:

* Ranked shop list
* Distance
* Delivery fee
* Estimated time

---

## 📊 Example Use Case

User searches: "Paracetamol"

System:

* Finds all medical stores
* Calculates distance
* Applies ML scoring
* Returns best pharmacy nearby

---

## 🔮 Future Enhancements

* Real shop database integration
* Firebase Authentication
* Payment gateway integration
* Real-time stock update system
* Admin dashboard
* Deep learning recommendation system

---

## 🎯 Problem It Solves

* Helps users find nearby stores easily
* Saves delivery cost
* Supports local businesses
* Provides smart ranking instead of random listing

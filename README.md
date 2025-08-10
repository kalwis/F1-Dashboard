# 🏎️ F1 Analytics Dashboard – S1_DS_03

An interactive Formula 1 data analytics platform designed to evaluate driver and constructor performance using a custom Elo rating system and machine learning-based race predictions. Built using a Python backend (FastAPI), PostgreSQL database, and a React frontend, the dashboard brings deep data insights to fans, analysts, and developers.

## 👥 Team Members

**Team Name**: `S1_DS_03`  
**Members**:
- Isaac – Front-End Developer  
- Joshua – Machine Learning Engineer  
- Lohith – Backend & Database Engineer  
- Ryan – Elo Algorithm & Model Design  
- Kisara – Project Coordinator & Documentation Lead  

---

## 📌 Project Overview

Formula 1 is a sport driven by both speed and data. While teams have access to deep analytics, fans often rely only on basic stats like championship points. This dashboard aims to fill that gap by offering:

- A fair, transparent **Elo-based ranking system** for both drivers and constructors
- **Race and Qualifying predictions** using practice data and past performances
- **Interactive visualisations** showing performance trends, comparisons, and predictions

---

## 🔧 Tech Stack

| Layer        | Tool/Framework       |
|--------------|----------------------|
| Frontend     | React.js             |
| Backend      | Python (FastAPI)     |
| Database     | PostgreSQL           |
| ML Libraries | scikit-learn, pandas, numpy, xgboost |
| Data Sources | FastF1, Jolpica API  |
| Versioning   | Git + GitHub         |

---

## 🚀 Features

### ✅ Functional
- **F1**: Main dashboard with rankings, predictions, and visualisations  
- **F2**: Q3 Qualifying Prediction using practice, Q1, and Q2 data  
- **F3**: Race Prediction using start grid + practice pace  
- **F4**: Elo Ranking for Drivers and Cars (separate using one-vs-all logic)  
- **F5**: Combined Elo for Driver-Car pairs using dynamic k-factors  
- **F6**: Automatically updated daily PostgreSQL database  
- **F7**: Graphs showing Elo rating changes over time  
- **F8**: Head-to-head comparison of drivers or constructors  

### ⚙️ Non-Functional
- **NF1**: High usability and responsive UI  
- **NF2**: Reliable and synced to official race data  
- **NF3**: Performance-optimized with quick loads (under 5s)  
- **NF4**: Scalable architecture as seasons evolve  

---

## 📈 Visual Highlights

The dashboard uses a modern, dark-themed interface with accessible colours and scalable layout patterns (Z-pattern and F-pattern). Charts and tables are filterable by driver, constructor, or date, and update live via API queries.

---

## 🔄 System Architecture

1. **Data Ingestion**: Fetched from FastF1 and Jolpica APIs  
2. **Processing**: Cleaned, transformed, and analyzed using Python  
3. **Storage**: Stored in PostgreSQL with 24-hour auto-updates  
4. **Modelling**:
   - Elo rating updates using a one-vs-all formula
   - Race & Q3 predictions via ML models
5. **API Layer**: FastAPI exposes endpoints for the frontend  
6. **Frontend**: React-based UI shows graphs, tables, and comparisons

---

## 📊 Example Endpoints

```http
GET /elo/driver
GET /elo/constructor
GET /predict/qualifying
GET /predict/race
GET /compare/headtohead
```

Start the API locally with:

```bash
uvicorn backend.main:app --reload

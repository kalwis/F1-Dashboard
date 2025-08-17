# F1 Dashboard

A comprehensive Formula 1 dashboard application with real-time data visualization and analysis.

## Architecture

This application consists of:
- **Backend**: Flask API server using the fastf1 library to fetch F1 data
- **Frontend**: React application with modern UI components

## Setup Instructions

### Backend Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the Flask API server:**
   ```bash
   cd app
   python main.py
   ```
   
   The API server will run on `http://localhost:5000`

### Frontend Setup

1. **Install Node.js dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the React development server:**
   ```bash
   npm start
   ```
   
   The frontend will run on `http://localhost:3000`

## API Endpoints

The Flask backend provides the following endpoints:

- `GET /api/driver-standings?year=current` - Get driver standings
- `GET /api/constructor-standings?year=current` - Get constructor standings
- `GET /api/season-schedule?year=current` - Get season schedule
- `GET /api/race-results?year=current&round=1` - Get race results
- `GET /api/qualifying-results?year=current&round=1` - Get qualifying results
- `GET /api/drivers?year=current` - Get drivers list
- `GET /api/constructors?year=current` - Get constructors list
- `GET /api/circuits?year=current` - Get circuits list
- `GET /api/health` - Health check

## Features

- **Real-time F1 Data**: Live driver and constructor standings
- **Race Results**: Latest race results and qualifying sessions
- **Season Schedule**: Upcoming races and past events
- **Interactive Charts**: Elo rating history and performance analytics
- **Responsive Design**: Modern UI that works on all devices

## Data Sources

- **FastF1 Library**: Python library for accessing F1 data
- **Ergast API**: Historical F1 data through fastf1's Ergast integration

## Development

### Backend Development
- The Flask API uses the fastf1 library to fetch data from the Ergast API
- Data is cached to improve performance
- CORS is enabled for frontend communication

### Frontend Development
- React components use the fastf1Api service to communicate with the backend
- Components include fallback data for offline scenarios
- Modern UI with Tailwind CSS styling

## Troubleshooting

1. **Backend not starting**: Make sure all Python dependencies are installed
2. **Frontend can't connect to API**: Ensure the Flask server is running on port 5000
3. **No data loading**: Check the browser console for API errors
4. **CORS issues**: The backend has CORS enabled, but check if the frontend URL is correct

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both backend and frontend
5. Submit a pull request

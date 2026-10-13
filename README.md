# Patient Transport & Live Tracking — Web Prototype

A runnable UI-first prototype for a routine patient pickup/drop-off platform.

## What's included
- React + Vite frontend
- Node.js + Express mock backend
- In-memory demo data (no MySQL setup required)
- Patient booking form and booking list
- Booking details/status updates
- Simulated live GPS tracking map panel
- Drivers, vehicles, partners and dashboard views
- Responsive layout and demo navigation

> This is a demo prototype. Data is stored in backend memory and resets when the server restarts.
> The tracking coordinates are simulated, not real GPS. Do not use this prototype for real patient transport.

## Requirements
- Node.js 18+ (Node 20+ recommended)
- npm

## Run locally

### 1. Start the backend
Open a terminal in `backend`:

```bash
npm install
npm run dev
```

Backend runs at http://localhost:5000

### 2. Start the frontend
Open a second terminal in `frontend`:

```bash
npm install
npm run dev
```

Open the URL Vite prints, usually http://localhost:5173

## Demo features
- Use the left navigation to switch between Dashboard, Bookings, Live Tracking, Drivers, Vehicles, Partners and Settings.
- Click **New Booking** to create a demo booking.
- Use booking row actions to view details or change status.
- Live Tracking has a demo trip selector and simulated moving vehicle.
- Use **Reset demo data** in Settings to restore sample data.

## MySQL later
The backend is deliberately database-free for the first UI review. When ready, replace the in-memory data module in `backend/src/data/store.js` with Sequelize models/services and MySQL migrations. The API route shapes are intended to remain similar.

## API quick reference
- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/bookings`
- `POST /api/bookings`
- `GET /api/bookings/:id`
- `PATCH /api/bookings/:id/status`
- `GET /api/drivers`
- `GET /api/vehicles`
- `GET /api/partners`
- `GET /api/tracking/:bookingId`
- `POST /api/demo/reset`

## Prototype limitations
- Authentication/roles are represented by the UI only.
- No real OTP, SMS, payment gateway, map provider or GPS integration is configured.
- Backend records are in memory, so a server restart resets changes.
- The tracking map is a visual simulation, not a geographic routing service.

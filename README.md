# StitchNow MVP

A full-stack responsive tailoring and boutique booking MVP.

## Tech Stack
Frontend: React + Vite + React Router + Axios + CSS
Backend: Node.js + Express + MongoDB + JWT
Database: MongoDB Atlas

## Run Backend
```bash
cd backend
npm install
cp .env.example .env
# add your MongoDB URI and JWT secret
npm run dev
```

## Run Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Flow
1. Register as boutique owner.
2. Go to Dashboard and create a boutique.
3. Add services.
4. Register/Login as customer.
5. Browse boutiques and book a service.
6. Track order from My Orders.

## Next Features To Add
- Cloudinary upload
- Razorpay payment
- Google Maps
- Socket.io chat
- Admin panel

# UltimateHealth Backend Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- Git

## Step-by-Step Setup

### 1. Clone the backend repository

` ` `bash
git clone https://github.com/SB2318/ultimatehealth-backend.git
cd ultimatehealth-backend
` ` `

### 2. Install dependencies

` ` `bash
npm install
` ` `

### 3. Configure environment variables

Create a `.env` file in the root directory:

` ` `env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ultimatehealth
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
` ` `

### 4. Start MongoDB

**Local MongoDB:**
` ` `bash
mongod
` ` `

**MongoDB Atlas:** Use your Atlas connection string in `MONGODB_URI`.

### 5. Run the backend server

` ` `bash
npm run dev
` ` `

The API will be available at `http://localhost:5000`

API Documentation: `http://localhost:5000/api/docs`

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 5000 | Server port |
| `MONGODB_URI` | Yes | - | MongoDB connection string |
| `JWT_SECRET` | Yes | - | Secret for JWT tokens |
| `JWT_EXPIRES_IN` | No | 7d | JWT expiration |
| `NODE_ENV` | No | development | Environment mode |

## Troubleshooting

### Port already in use
` ` `bash
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows
kill -9 <PID>
` ` `

### MongoDB connection error
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env`
- For Atlas, whitelist your IP address

### JWT errors
- Ensure `JWT_SECRET` is set in `.env`
- Use a strong secret (minimum 32 characters)

### Dependency installation fails
` ` `bash
rm -rf node_modules package-lock.json
npm install
` ` `

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with hot reload |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run lint` | Run linter |

## Support

For issues, please open a GitHub issue or contact maintainers.

---
*Documentation for GSSoC 2026*

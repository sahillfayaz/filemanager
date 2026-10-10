# Smart Social Information File System

SIFS is a file-management application for organizing, searching, and sharing files with contextual metadata. It includes a React frontend and an Express/MongoDB API.

## Features

- Upload files with metadata, tags, and contextual information
- Search files and detect duplicates by SHA-256 hash
- Organize files across content, archive, and deletion spaces
- Browse activity history and knowledge relationships
- Create expiring, revocable file-sharing links

## Requirements

- Node.js 18 or newer
- MongoDB, local or hosted

## Run Locally

In a terminal, install and configure the backend:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Set `MONGO_URI` and a strong, unique `JWT_SECRET` in `backend/.env`, then start the API:

```powershell
npm run dev
```

In a second terminal, start the frontend:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`. The frontend uses the API at `http://localhost:5000/api` by default. Set `VITE_API_URL` in `frontend/.env` only when the API is hosted elsewhere.

See [backend/README.md](backend/README.md) for backend configuration, API routes, and storage details.

## Repository Layout

- `backend/` - Express API, MongoDB models, and local upload storage
- `frontend/` - React application built with Vite

Environment files, dependencies, build output, and uploaded files are excluded from Git. Back up uploaded files and the MongoDB database separately; they are not included in the repository.

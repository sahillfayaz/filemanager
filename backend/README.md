# Smart Social Information File System Backend

Phase 1 backend implementation for the SIFS college project.

Phase 2 is also implemented: concept and instance trees, inverted file trees,
provenance records, relationship mapping, and revocable file-share links.

## Features

- File upload with Multer
- Local file storage
- SHA256 hashing
- Duplicate hash detection
- File metadata
- Contextual file mapping
- Content, archive, and deletion spaces
- Activity logging
- Dashboard statistics
- MVC architecture with services

## Setup

1. Install dependencies:

```bash
cd backend
npm install
```

2. Create `.env`:

```bash
cp .env.example .env
```

3. Add your MongoDB Atlas connection string:

```env
PORT=5000
HOST=0.0.0.0
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/sifs?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE_MB=25
DEFAULT_USER=System User
JWT_SECRET=replace-with-a-long-random-secret
```

Use a long, unique value for `JWT_SECRET` and keep `.env` private.

4. Start the backend:

```bash
npm run dev
```

The API runs at:

```txt
http://localhost:5000/api
```

To open the frontend from another device on the same network, start Vite with
the configured host, then browse to `http://<computer-ip>:5173`. The frontend
will use that same hostname for the API automatically. Make sure Windows
Firewall allows inbound TCP traffic on ports 5173 and 5000.

## API Summary

### Files

```txt
POST   /api/files/upload
GET    /api/files?status=content
GET    /api/files/:id
GET    /api/files/:id/download
PATCH  /api/files/:id/archive
PATCH  /api/files/:id/restore
PATCH  /api/files/:id/deletion
DELETE /api/files/:id/permanent
```

Upload field name:

```txt
file
```

Upload form-data fields:

```txt
employee
department
event
year
category
tags
description
uploadedBy
metadata
```

`metadata` can be a JSON string:

```json
[
  { "key": "Document Type", "value": "Certificate" },
  { "key": "Issued By", "value": "College" }
]
```

### Search

```txt
GET /api/search?query=sahil
GET /api/search/context?employee=Sahil&department=ISE&event=Workshop&year=2026
GET /api/search/hash/:sha256Hash
```

### Metadata

```txt
GET    /api/metadata/file/:fileId
POST   /api/metadata/file/:fileId
PUT    /api/metadata/context/:fileId
PUT    /api/metadata/:id
DELETE /api/metadata/:id
```

### Activity

```txt
GET /api/activity
GET /api/activity/file/:fileId
```

### Dashboard

```txt
GET /api/dashboard/stats
```

### Knowledge Graph (Phase 2)

```txt
GET    /api/knowledge/concepts/tree
POST   /api/knowledge/concepts
GET    /api/knowledge/instances
POST   /api/knowledge/instances
GET    /api/knowledge/inverted-tree?type=department&status=content
GET    /api/knowledge/provenance/:fileId
GET    /api/knowledge/relationships
POST   /api/knowledge/relationships
DELETE /api/knowledge/relationships/:id
```

`inverted-tree` accepts `employee`, `department`, `event`, `year`, `category`,
`tags`, or `metadata` as its `type`.

### File Sharing (Phase 2)

```txt
POST  /api/shares/file/:fileId
GET   /api/shares/file/:fileId
PATCH /api/shares/:id/revoke
GET   /api/shares/access/:token/download
```

Create a share with a recipient and a 1–90 day expiry:

```json
{
  "recipient": "recipient@example.com",
  "expiresInDays": 7
}
```

The creation response returns a one-time download URL. Only a SHA-256 hash of
the share token is stored. A link is invalid after its expiry or revocation.

## Storage Spaces

Files are physically moved between:

```txt
uploads/content
uploads/archive
uploads/deletion
```

MongoDB stores the logical record, metadata, context, hash, and status.

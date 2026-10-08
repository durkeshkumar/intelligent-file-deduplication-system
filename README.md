# Intelligent File Deduplication & Storage Optimization System

A full-stack file management and storage optimization system that automatically identifies duplicate files using SHA-256 hashing, analyzes storage consumption, calculates potential savings, and provides safe file deletion with complete audit tracking.

The system uses asynchronous background processing with Celery and Redis to efficiently process file hashing and duplicate detection, including large files.

---

## 🚀 Project Overview

The Intelligent File Deduplication & Storage Optimization System helps users manage their uploaded files and identify unnecessary duplicate storage.

The application:

- Uploads and manages files securely
- Generates SHA-256 hashes for files
- Detects identical files regardless of filename or upload location
- Groups duplicate files together
- Calculates duplicate storage consumption
- Calculates potential storage savings
- Processes large-file hashing asynchronously
- Provides file search, filtering, sorting, and pagination
- Supports safe deletion of files
- Maintains deletion history
- Maintains audit logs
- Provides storage analytics through charts
- Runs as a Dockerized full-stack application

---

# ✨ Key Features

## 🔐 Authentication

- User registration
- JWT-based authentication
- Secure login
- Current-user endpoint
- Protected API routes
- Protected frontend routes
- Automatic authorization using JWT

---

## 📁 File Management

Users can:

- Upload files
- View uploaded files
- View detailed file information
- Download files
- Delete files safely
- Search files by filename
- Filter files by type
- Filter by file size
- Filter duplicate/non-duplicate files
- Filter by hash processing status
- Filter by upload date
- Sort by filename
- Sort by file size
- Sort by upload date
- Paginate file results

---

## 🔍 SHA-256 File Deduplication

Every uploaded file can be processed using SHA-256 hashing.

The system identifies identical files based on their content rather than:

- Filename
- Upload time
- Storage filename
- Upload location

Therefore, two files with different names but identical content can still be identified as duplicates.

Example:

```text
document.pdf
copy_document.pdf
backup_document.pdf

If all three files contain exactly the same data, they will have the same SHA-256 hash and can be grouped together.
⚡ Asynchronous Hash Processing
Large-file processing is handled asynchronously using:
- Celery
- Redis
The upload process does not need to block while a large file is being hashed.
Processing states include:
PENDING
PROCESSING
COMPLETED
FAILED

Architecture:
FastAPI
   |
   | Queue hashing task
   v
Redis
   |
   v
Celery Worker
   |
   v
SHA-256 Processing
   |
   v
MySQL

🗂 Duplicate Groups
Duplicate files are organized into duplicate groups based on their SHA-256 hash.
Each group provides:
- Group ID
- SHA-256 hash
- Original file
- Number of files
- Total storage consumed
- Potential storage savings
- Creation date
The frontend provides a dedicated duplicate-management page and duplicate-group details page.
💾 Storage Optimization
The system calculates:
Total Storage
Duplicate Storage
Potential Savings

Example:
File A = 10 MB
File B = 10 MB
File C = 10 MB

Total Storage = 30 MB
Original Storage = 10 MB
Potential Savings = 20 MB

This allows users to understand how much storage can potentially be recovered.
🛡 Safe File Deletion
The system provides controlled file deletion.
Before deletion:
- File ownership is verified
- Deleted files are ignored
- Protected files cannot be deleted
- Physical storage is removed
- Database record is soft-deleted
- Deletion history is created
- Audit log is created
Protected files return:
Protected files cannot be deleted

📜 Deletion History
Users can view previously deleted files.
The deletion history contains:
- History ID
- File ID
- Filename
- File size
- Deletion reason
- Deleted date/time
The page also calculates the amount of storage freed.
📝 Audit Logs
Important account activities are recorded in audit logs.
Audit records contain:
- Action
- Entity type
- Entity ID
- Description
- IP address
- Timestamp
Example action:
DELETE_FILE

Audit logs can also be filtered by action.
📊 Storage Analytics
The analytics dashboard provides:
- Total files
- Total storage
- Duplicate files
- Duplicate storage
- Potential savings
Visual analytics include:
- Storage distribution
- Unique vs duplicate storage
- Unique vs duplicate files
Charts are implemented using Recharts.
🔎 Search, Filtering & Pagination
The file management page supports:
Search
Search by filename.
File Type
Examples:
.pdf
.txt
.doc
.docx
.jpg
.jpeg
.png
.zip

File Size
Minimum Size
Maximum Size

Duplicate Status
All
Duplicate
Non-Duplicate

Hash Status
PENDING
PROCESSING
COMPLETED
FAILED

Date
From Date
To Date

Sorting
Upload Date
File Size
Filename

Pagination
The API supports page-based pagination with configurable page size.
🏗️ System Architecture
                         ┌────────────────────────┐
                         │     React Frontend     │
                         │   TypeScript + Vite    │
                         │      Material UI       │
                         └───────────┬────────────┘
                                     │
                                     │ HTTP / REST
                                     ▼
                         ┌────────────────────────┐
                         │    FastAPI Backend     │
                         │     Python 3.12        │
                         │        JWT Auth        │
                         └───────┬────────┬───────┘
                                 │        │
                       SQL       │        │ Background Tasks
                                 │        │
                                 ▼        ▼
                         ┌──────────┐  ┌──────────┐
                         │  MySQL   │  │  Redis   │
                         │   8.0    │  │          │
                         └──────────┘  └────┬─────┘
                                            │
                                            ▼
                                     ┌─────────────┐
                                     │    Celery   │
                                     │    Worker   │
                                     └──────┬──────┘
                                            │
                                            ▼
                                     SHA-256 Hashing

🛠️ Technology Stack
Backend
Technology	Purpose
Python 3.12	Backend language
FastAPI	REST API framework
SQLAlchemy	ORM
MySQL 8.0	Database
Alembic	Database migrations
Pydantic	Validation/settings
JWT	Authentication
Celery	Background processing
Redis	Message broker/result backend
SHA-256	File hashing


Frontend
Technology	Purpose
React	UI framework
TypeScript	Type safety
Vite	Frontend build tool
Material UI	UI components
Axios	API communication
React Router	Routing
Recharts	Analytics charts


DevOps
Technology	Purpose
Docker	Containerization
Docker Compose	Multi-container orchestration
Nginx	Frontend production server
Git	Version control
GitHub	Source code hosting


📂 Project Structure
intelligent-file-deduplication-system/
│
├── backend/
│   │
│   ├── app/
│   │   ├── celery_app/
│   │   │   ├── celery.py
│   │   │   └── __init__.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── dependencies.py
│   │   │   ├── logging.py
│   │   │   └── security.py
│   │   │
│   │   ├── db/
│   │   │   └── database.py
│   │   │
│   │   ├── models/
│   │   │   ├── audit_log.py
│   │   │   ├── deletion_history.py
│   │   │   ├── duplicate_group.py
│   │   │   ├── file.py
│   │   │   ├── file_hash.py
│   │   │   ├── file_metadata.py
│   │   │   └── user.py
│   │   │
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── audit_logs.py
│   │   │   └── files.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── audit_log.py
│   │   │   ├── auth.py
│   │   │   └── file.py
│   │   │
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── duplicate_group_service.py
│   │   │   ├── duplicate_service.py
│   │   │   ├── file_service.py
│   │   │   ├── hash_service.py
│   │   │   └── storage_service.py
│   │   │
│   │   ├── tasks/
│   │   │   └── file_tasks.py
│   │   │
│   │   ├── utils/
│   │   │   └── file_hash.py
│   │   │
│   │   └── main.py
│   │
│   ├── alembic/
│   │   ├── versions/
│   │   ├── env.py
│   │   └── script.py.mako
│   │
│   ├── storage/
│   ├── .env
│   ├── .env.docker
│   ├── .env.example
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── Dockerfile.celery
│   ├── alembic.ini
│   └── requirements.txt
│
├── frontend/
│   │
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.ts
│   │   │
│   │   ├── components/
│   │   │   └── layout/
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Files.tsx
│   │   │   ├── FileDetails.tsx
│   │   │   ├── Duplicates.tsx
│   │   │   ├── DuplicateGroupDetails.tsx
│   │   │   ├── DeletionHistory.tsx
│   │   │   ├── AuditLogs.tsx
│   │   │   └── Analytics.tsx
│   │   │
│   │   ├── routes/
│   │   │   └── AppRoutes.tsx
│   │   │
│   │   ├── types/
│   │   │   └── index.ts
│   │   │
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   │
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .dockerignore
│   ├── .env.docker
│   ├── package.json
│   └── vite.config.ts
│
├── .env
├── .gitignore
├── docker-compose.yml
└── README.md

⚙️ Local Development Setup
1. Clone the repository
git clone <your-github-repository-url>
cd intelligent-file-deduplication-system

2. Backend Setup
Go to backend:
cd backend

Create virtual environment:
python -m venv venv

Activate on Windows:
venv\Scripts\activate

Install dependencies:
pip install -r requirements.txt

3. Configure Environment Variables
Create:
backend/.env

Example:
APP_NAME=Intelligent File Deduplication & Storage Optimization System
APP_VERSION=1.0.0
DEBUG=True

DATABASE_URL=mysql+pymysql://root:password@localhost:3306/file_deduplication_db

JWT_SECRET_KEY=your_secure_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

FILE_STORAGE_PATH=storage

REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/1

Never commit real passwords or secret keys.
🗄️ Database Migration
From the backend directory:
alembic upgrade head

▶️ Run Backend
uvicorn app.main:app --reload

Backend:
http://127.0.0.1:8000

Swagger:
http://127.0.0.1:8000/docs

⚡ Run Celery Worker
Make sure Redis is running.
From the backend directory:
celery -A app.celery_app.celery:celery_app worker --loglevel=info

💻 Frontend Setup
Go to frontend:
cd frontend

Install dependencies:
npm install

Run development server:
npm run dev

Frontend:
http://localhost:5174

🐳 Docker Setup
The application can run completely using Docker Compose.
From the project root:
docker compose build

Start all services:
docker compose up -d

Check containers:
docker compose ps

Stop containers:
docker compose down

View logs:
docker compose logs

Backend logs:
docker compose logs backend

Celery logs:
docker compose logs celery

🐳 Docker Services
Docker Compose runs:
MySQL
Redis
FastAPI Backend
Celery Worker
React + Nginx Frontend

Architecture:
docker-compose.yml
        |
        +-- MySQL
        |
        +-- Redis
        |
        +-- Backend
        |
        +-- Celery
        |
        +-- Frontend/Nginx

🌐 Docker URLs
Frontend:
http://localhost:5174

Backend Swagger:
http://localhost:8010/docs

Backend:
http://localhost:8010

🔌 Main API Endpoints
Authentication
POST /auth/register
POST /auth/login
GET  /auth/me

Files
POST /files/upload
GET  /files/
GET  /files/{file_id}
GET  /files/{file_id}/download
POST /files/{file_id}/hash
POST /files/{file_id}/check-duplicate
DELETE /files/{file_id}

Storage
GET /files/storage/statistics

Duplicate Groups
GET  /files/duplicate-groups
GET  /files/duplicate-groups/{group_id}
POST /files/duplicate-groups/rebuild

Deletion History
GET /files/history/deletions

Audit Logs
GET /audit-logs/

🔐 Security
The application implements:
- JWT authentication
- Password hashing
- Protected API endpoints
- User ownership validation
- Protected file deletion
- File metadata validation
- Environment-based configuration
- Secure secret configuration
- Controlled file storage
- Audit logging
Sensitive configuration should always be stored in environment variables.
🧮 Duplicate Detection Logic
The system uses SHA-256 hashing.
Conceptually:
Uploaded File
      |
      v
Read File in Chunks
      |
      v
SHA-256 Hash
      |
      v
Search Existing Hash
      |
      +------ No Match ------> Unique File
      |
      +------ Match ---------> Duplicate
                                  |
                                  v
                           Duplicate Group

Chunked processing makes the system suitable for larger files without loading the entire file into memory.
📦 Database Tables
The application contains the following major tables:
users
files
file_hashes
duplicate_groups
file_metadata
deletion_history
audit_logs

🧪 Testing
The application was manually tested through Swagger and Postman.
Tested functionality includes:
- User registration
- User login
- JWT authentication
- Current-user API
- File upload
- File listing
- File hashing
- Duplicate detection
- Storage statistics
- Duplicate groups
- Duplicate-group rebuilding
- File details
- File download
- Deletion history
- Audit logs
- Safe file deletion
- Protected file deletion
- Deleted-file access handling
- Search and filtering
- Sorting
- Pagination
- Dockerized frontend
- Dockerized backend
- Dockerized Celery
- Dockerized Redis
- Dockerized MySQL
🏆 Project Highlights
This project demonstrates practical experience with:
- REST API development
- FastAPI
- Python
- SQLAlchemy
- MySQL
- Alembic
- JWT authentication
- React
- TypeScript
- Material UI
- Axios
- Redis
- Celery
- Background task processing
- SHA-256 hashing
- File management
- Database design
- Storage optimization
- Audit logging
- Docker
- Nginx
- Docker Compose
- Production builds
# Enterprise Lead Management System (LMS)

A full-stack, multi-tenant SaaS Lead Management System built using the MERN Stack. It helps organizations manage leads, track sales pipelines, schedule follow-ups, and monitor business performance through a centralized platform.

## Features

### Authentication & Multi-Tenancy
- Secure user authentication using JWT.
- Organization-based registration and login.
- Multi-tenant architecture.
- Organization-level data isolation.
- Membership-based user access.

### Lead Management
- Create, view, update, and delete leads.
- Store lead contact information and business details.
- Assign leads to team members.
- Track lead sources and statuses.
- Search, filter, and paginate leads.

### Pipeline Management
- Kanban-style sales pipeline.
- Configurable pipeline stages.
- Drag-and-drop lead stage management.
- Track won and lost leads.
- Record loss reasons.

### Follow-Up Management
- Schedule lead follow-ups.
- Add follow-up notes and activities.
- Track upcoming and overdue follow-ups.
- Maintain lead interaction history.

### User & Role Management
- Organization user management.
- Role-based access control (RBAC).
- Permission-based module access.
- Manage team members and responsibilities.

### Dashboard & Analytics
- Lead statistics and summaries.
- Pipeline performance.
- Lead conversion tracking.
- Sales activity overview.

### Audit & System Settings
- Track important lead changes.
- Maintain activity history.
- Manage lead sources, tags, and pipeline stages.
- Organization-level settings.

## Tech Stack

### Frontend
- React.js
- JavaScript
- Tailwind CSS
- Axios
- React Query

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

## Project Architecture

```text
lead-management-system/
│
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── services/
│   ├── validations/
│   ├── app.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## Installation & Setup

### 1. Clone Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd lead-management-system
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Start the backend development server:

```bash
npm run dev
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the frontend directory.

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm run dev
```

## Environment Variables

Configure the required environment variables before starting the application.

Never commit actual `.env` files, database credentials, or private API keys to GitHub.

## Deployment

Deployment can be configured using:

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## Future Enhancements

- Email and WhatsApp integration.
- Advanced sales analytics.
- Automated lead assignment.
- Real-time notifications.
- Advanced reporting and exports.
- Third-party CRM integrations.

## Author

**Aayush Jangir**

Full Stack Developer | MERN Stack


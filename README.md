# Rail Madad - Smart Complaint Management System

Rail Madad is a full-stack web application for registering, routing, tracking, and managing railway complaints. It supports passenger complaint submission, image upload, role-based operational dashboards, and admin analytics.

## Features

- Passenger complaint registration and tracking
- Image upload for complaints
- AI-assisted category mapping for train complaints (external inference endpoint integration)
- Role-based workflows for Railway Staff, RPF, and Station Master
- Admin dashboard with analytics and charts
- Interactive complaint map with Leaflet
- Secure admin session handling with JWT + cookies

## Current Tech Stack

### Frontend

- Next.js (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- Radix UI primitives with reusable UI components
- Recharts for admin analytics graphs
- Leaflet for map visualization

### Backend

- Next.js Route Handlers (API routes under `app/api`)
- MongoDB (official `mongodb` Node.js driver)
- JWT authentication using `jose`
- Password hashing with `bcryptjs`
- Schema validation using `zod`

### Other Libraries and Tooling

- React Hook Form + `@hookform/resolvers`
- `next-themes` for theme support
- `lucide-react` icons
- `@vercel/analytics`
- Seed and maintenance scripts in `scripts/`

## Architecture Overview

1. Passenger submits complaint details and optional image.
2. Image is uploaded to `public/uploads` through API.
3. Complaint is registered in MongoDB with generated complaint ID.
4. For train complaints with images, optional model inference is called via `MODEL_INFERENCE_URL`.
5. Complaint is routed to role-specific users based on category, train mapping, and nearest station logic.
6. Admin and role dashboards consume API routes for live complaint operations and analytics.

## Project Structure

```text
Rail_Madad/
|- app/                        # Next.js App Router pages + API routes
|  |- admin/                   # Admin pages (analytics, complaints, map, settings)
|  |- role-login/              # Role login and role dashboards
|  |- api/                     # Backend route handlers
|- components/                 # Reusable UI and feature components
|- lib/
|  |- server/                  # DB, auth, stations, image classifier logic
|- data/                       # Static data (for example stations.csv)
|- scripts/                    # Seed and maintenance scripts
|- public/uploads/             # Uploaded complaint images
```

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Create a `.env.local` file with at least:

```env
MONGODB_URI=your_mongodb_connection_string
AUTH_SECRET=your_strong_secret
MODEL_INFERENCE_URL=https://your-model-endpoint.example/predict
MODEL_API_KEY=optional_api_key

# OTP / SMS configuration
# Fast2SMS settings
FAST2SMS_API_KEY=your_fast2sms_api_key
# Optional: choose SMS provider
SMS_PROVIDER=auto
# Twilio settings (optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=+1xxxxxxxxxx
# Development only: expose debug OTP in API response when SMS cannot be sent
OTP_EXPOSE_DEBUG_OTP=false
```

### 3. Run the development server

```bash
pnpm dev
```

### 4. Open application

Visit `http://localhost:3000`.

## Key API Areas

- Public complaints
  - `POST /api/complaints/upload`
  - `POST /api/complaints/register`
  - `GET /api/complaints/track?id=RMXXXXXXXX`
- Admin
  - `POST /api/admin/login`
  - `POST /api/admin/logout`
  - `GET /api/admin/complaints`
  - `GET /api/admin/analytics`
- Role operations
  - Railway Staff, RPF, and Station Master login, assignment, and status update APIs

## Useful Scripts

```bash
pnpm seed:admins
pnpm seed:users
pnpm seed:railway-staff
pnpm seed:rpf
pnpm seed:station-master
pnpm cleanup:images
```



## 🐳 Docker Setup

 The Rail Madad application is containerized using Docker for consistent development and deployment.

### Dockerfile

The project uses a Node.js 20 Alpine image to run the Next.js application.

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Build Docker Image

Run the following command from the project root:

```bash
docker build -t rail-madad .
```

### Run the Container

```bash
docker run -p 3000:3000 --env-file .env.local rail-madad
```

The application can then be accessed at:

```text
http://localhost:3000
```

### Docker Commands

```bash
# Check running containers
docker ps

# View container logs
docker logs <container_id>

# Stop a container
docker stop <container_id>

# Remove a container
docker rm <container_id>

# List Docker images
docker images
```

### AI Model

The **ViT-B/16 model** runs separately on Google Colab using GPU resources. The Docker container runs the main Next.js application and communicates with the model service for image classification.

## Notes

- This README reflects the current codebase architecture in this repository.
- Older Flask/SQLite references are obsolete for the current implementation.

## Team

- C H Prabhu Kishor
- Harshan Gowda K S
- Pothula Bharath
- Sachin

## License

For academic and research purposes.

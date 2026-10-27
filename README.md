# DevLaunch Full-Stack Landing Page

Beginner-friendly starter project using React + Vite, Node.js, Express, and MySQL.
Includes a responsive marketing landing page, contact form, and simple admin dashboard.

## Requirements
- Node.js LTS (includes npm)
- MySQL Server + MySQL Workbench (or another MySQL client)
- VS Code

## Project structure
- `client/` React + Vite frontend
- `server/` Express REST API and MySQL connection
- `server/schema.sql` database and table setup

## 1. Create the database
Open MySQL Workbench and run the contents of `server/schema.sql`.
This creates the `devlaunch` database, `enquiries` table, and an admin user table.
For a real deployment, change the demo admin password and use environment variables.

## 2. Start the backend
Open a terminal in VS Code:
```powershell
cd server
npm install
Copy-Item .env.example .env
```
Edit `server/.env` with your local MySQL username/password.
Then create the demo admin and start the API:
```powershell
npm run seed-admin
npm run dev
```
API runs at http://localhost:5000

## 3. Start the frontend
Open a second terminal:
```powershell
cd client
npm install
Copy-Item .env.example .env
npm run dev
```
Open the URL Vite prints, normally http://localhost:5173.

## 4. Admin access
Open `/admin` on the Vite URL.
Demo login:
- Email: `admin@devlaunch.local`
- Password: `ChangeMe123!`

The seed command generates a real bcrypt password hash. You can set `DEMO_ADMIN_PASSWORD` in `server/.env` before running the seed command.
For production, replace the demo account/password and add rate limiting, HTTPS, and stronger session management.

## API routes
- `GET /api/health` — health check
- `POST /api/enquiries` — create contact enquiry
- `POST /api/admin/login` — admin login; returns a short-lived JWT
- `GET /api/admin/enquiries` — list enquiries (requires bearer token)
- `PATCH /api/admin/enquiries/:id/status` — update status (requires bearer token)
- `DELETE /api/admin/enquiries/:id` — delete enquiry (requires bearer token)

## Deployment outline
1. Push this project to a GitHub repository.
2. Deploy `server/` as a Node web service on Render (Root Directory: `server`).
3. Create a managed MySQL database with a provider that supports external connections, then set the backend environment variables (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `CLIENT_ORIGIN`, `NODE_ENV`).
4. Deploy `client/` as a static site (Root Directory: `client`; Build command: `npm install && npm run build`; Publish directory: `dist`).
5. Set frontend environment variable `VITE_API_URL` to your backend URL, without a trailing slash.
6. Set backend `CLIENT_ORIGIN` to your deployed frontend URL and redeploy both services.

Note: Render does not provide a native managed MySQL database in every plan/region. Use a MySQL-compatible managed provider if MySQL is required. Confirm provider pricing, network access, and backup policy before choosing. Do not use a local MySQL database as the production database.

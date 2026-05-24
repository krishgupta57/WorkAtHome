# WorkAtHome ⚡ Home Service Booking Platform

WorkAtHome is a production-grade, full-stack home service booking platform modeled after industry-leading products like **Urban Company** and **TaskRabbit**. It connects customers with background-verified, skilled professionals (electricians, plumbers, drivers, carpenters, cleaners) in a completely secure, real-time ecosystem.

---

## 🚀 Key Technical Features

### 1. Robust Escrow Payment Engine & Transparent Pricing
Each service booking automatically incorporates the platform fee and commission:
- **Platform Fee**: ₹40 fixed fee added to Customer payment.
- **Admin Commission**: 10% on base service price (deducted from Worker's share).
- **Escrow Settlement**: Customer funds are securely held in platform escrow and disbursed to the worker's payout balance instantly upon job completion verification.
- **Formula**:
  - `Customer Pays` = Service Price + ₹40 + (10% * Service Price)
  - `Worker Share` = Service Price - (10% * Service Price)
  - `Admin Share` = ₹40 + (10% * Service Price)

### 2. SimpleJWT Role-Based Session Architecture
Unified secure authentication with separate permission mappings:
- **Customers**: Search workers by category, filter by price/ratings/badges, picked dates, book slots, write reviews, manage address book.
- **Workers**: Configure base hourly rate, bio, experience, set calendar availability slots, accept/reject requests, complete orders, view analytics.
- **Admins**: Monitor platform revenue, verify workers, suspend users, check popular category analytics.

### 3. Live WebSockets Chat & Alerts
Powered by **Django Channels**:
- Private live chat channels between Customers and Workers for accepted jobs.
- Direct notification toasts on booking creations, acceptances, completions, and successful payments.
- Dynamic unread notification badges.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React.js, Vite, Tailwind CSS (v4), Redux Toolkit, Framer Motion, Recharts, Lucide Icons, React Hot Toast.
- **Backend**: Django, Django REST Framework (DRF), SimpleJWT, Django Channels, Daphne, SQLite (dynamic PostgreSQL config).
- **Real-time**: ASGI protocol layers, in-memory / redis channels layers.

---

## 🔑 Default Test Credentials (Pre-seeded)

Use `python manage.py seed_data` to automatically populate the database with these credentials:

| Role | Email | Password | Details |
|---|---|---|---|
| **Super Admin** | `admin@workathome.com` | `admin123` | Platform revenue dashboard access |
| **Customer** | `john@gmail.com` | `user123` | 10k Escrow check capability |
| **Customer** | `emily@gmail.com` | `user123` | Customer booking portal |
| **Worker (Electrician)** | `alex@gmail.com` | `worker123` | Verified badge, pre-seeded slots |
| **Worker (Plumber)** | `sarah@gmail.com` | `worker123` | Verified plumber |
| **Worker (Driver)** | `james@gmail.com` | `worker123` | Luxe driver |

---

## ⚙️ Quick Start Installation

### Backend Setup (Django)

1. Open a terminal in `envfolder/` and activate the virtual environment:
   ```bash
   cd .\envfolder\
   .\Scripts\activate
   ```
2. Navigate to the Django project root:
   ```bash
   cd .\workathome\
   ```
3. Generate database migrations and apply them:
   ```bash
   python manage.py makemigrations myapp
   python manage.py migrate
   ```
4. Seed the test database:
   ```bash
   python manage.py seed_data
   ```
5. Run the ASGI dev server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup (React/Vite)

1. Open another terminal in `wat_frontend/`:
   ```bash
   cd .\wat_frontend\
   ```
2. Install node packages:
   ```bash
   npm install
   ```
3. Start the dev hot-reload server:
   ```bash
   npm run dev
   ```
4. Access the web app at `http://localhost:5173`.

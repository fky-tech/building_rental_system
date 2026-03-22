# How to Run the Project Locally

Follow these steps to run the Building Rental SaaS application on your local machine.

## 1. Prerequisites
- Node.js 18 or higher installed on your system.
- Basic knowledge of terminal/command prompt.
- `.env` file containing your Supabase credentials (you've already set this up).

## 2. Install Dependencies
Open your terminal, ensure you are in the `building_rental_system` directory, and run:
```bash
npm install
```

## 3. Database Initialization (Supabase)
Before starting the Next.js server, you must create the database tables:
1. Log into your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor** on the left menu.
3. Open the `init.sql` file from your project root, copy all of its content.
4. Paste the content into the Supabase SQL Editor and click **Run**. This creates all tables and policies you need.

## 4. Run the Development Server
In your terminal, start Next.js by running:
```bash
npm run dev
```
The server will start on `http://localhost:3000`.

## 5. Testing Multi-Tenant Subdomains Locally
Because we mapped subdomains (e.g. `building_slug.domain.com`) to specific properties, you can simulate this locally:
- **Admin/Owner Portal**: Go to `http://localhost:3000`
- **Building Specific Site**: Go to `http://YOUR_SLUG.localhost:3000` (Make sure your building slug from the database matches here).

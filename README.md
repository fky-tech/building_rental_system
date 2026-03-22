# Building Rental System

A full-stack SaaS web application using Next.js (App Router) and Supabase (PostgreSQL + Auth + Storage), designed for managing buildings, rooms, tenants, leases, and payments.

## Prerequisites
- Node.js 18+
- npm or yarn
- A Supabase account and project (https://supabase.com)

## Local Setup

1. **Clone or unzip the project** in your workspace.
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env.local` file at the root of the project and add the following keys from your Supabase dashboard (Project Settings > API):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Initialize the Database**:
   - Go to the Supabase SQL Editor.
   - Copy the contents of the `init.sql` file provided with this project.
   - Run the query to create tables (`owners`, `buildings`, `rooms`, `tenants`, `leases`, `payments`) and Row-Level Security (RLS) policies.
   - Go to Supabase Authentication > URL Configuration, and make sure `http://localhost:3000` is allowed as the Site URL.

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## Subdomain Multi-Tenancy (Local Testing)
To test subdomain routing on your local machine (e.g., `new_building.localhost:3000`):
- Ensure that you access the application using `http://localhost:3000` for the main site or `/admin` sections.
- To access a specific building's page, navigate to `http://<building_slug>.localhost:3000`, and the middleware will route appropriately.

## Deployment to Vercel

1. **Push your code** to a GitHub repository.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New..." > Project**.
3. Import your GitHub repository.
4. Open the **Environment Variables** section and add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Click **Deploy**.
6. **Subdomain Setup on Vercel**: 
   - Add a wildcard domain (e.g., `*.yourdomain.com`) in your project domain settings.
   - Configure DNS on your registrar with an A Record `*` pointing to `76.76.21.21` (Vercel IP) or a CNAME pointing to `cname.vercel-dns.com`.
7. **Supabase Redirects**: 
   - Add `https://yourdomain.com` and `https://*.yourdomain.com` to the authentication redirect allowlist in your Supabase dashboard.

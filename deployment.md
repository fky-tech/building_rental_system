# Deployment Guide (Vercel)

Vercel is the creator and ideal hosting provider for Next.js applications. Follow these steps to take your Building Rental System live.

## 1. Prepare your GitHub Repository
Vercel deploys apps directly from a Git repository:
1. Initialize a Git repository in your project folder if you haven't already.
2. Commit all your latest changes.
3. Push your repository to GitHub, GitLab, or Bitbucket.

## 2. Deploy on Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click the **"Add New..."** button, and select **"Project"**.
3. Import the Git repository you just created/pushed.
4. **Environment Variables**: Before hitting "Deploy", scroll down to the "Environment Variables" section. You MUST add the following three variables from your Supabase Dashboard or your local `.env` file:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (Used specifically for the admin backend scripts)
5. Click **Deploy**. Vercel will install dependencies, build the project, and give you a live URL.

## 3. Subdomain Setup (Wildcard Domains)
To make your dynamic subdomains (e.g. `abebe.yourapp.com`) work continuously with Vercel:
1. Go to your freshly deployed project in Vercel.
2. Go to **Settings > Domains**.
3. Enter your purchased base domain name (like `yourapp.com`).
4. Enter the wildcard version of your domain (`*.yourapp.com`) as well!
5. Follow Vercel's instructions to add an `A` record or `CNAME` targeting Vercel on your Domain Registrar (like Namecheap, GoDaddy). It might take an hour to propagate.
6. Once configured, requests to `anything.yourapp.com` will route to your Next.js application, and our built-in `middleware.ts` will parse the `anything` slug and serve the correct property.

## 4. Final Supabase Authentication Verification
1. Go back to your [Supabase Dashboard](https://supabase.com).
2. Head to **Authentication > URL Configuration**.
3. Under **Site URL**, enter your deployed base Vercel domain (e.g. `https://yourapp.com`).
4. Under **Redirect URLs**, add `https://*.yourapp.com` to ensure users can log in from any building subdomain.

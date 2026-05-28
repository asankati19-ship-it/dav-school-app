# D.A.V. School Admission Software — Deployment Guide

## What you need
- A computer with internet
- Free accounts on: [github.com](https://github.com), [supabase.com](https://supabase.com), [vercel.com](https://vercel.com)
- [Node.js](https://nodejs.org) installed (LTS version)

---

## Step 1 — Set up Supabase (your database)

1. Go to [supabase.com](https://supabase.com) → click **Start your project** → sign up free
2. Click **New project** → name it `dav-school` → set a strong database password → click **Create**
3. Wait ~2 minutes for it to set up
4. In the left sidebar, click **SQL Editor**
5. Copy the entire contents of `supabase_setup.sql` and paste it in → click **Run**
6. You should see "Success. No rows returned"

### Get your API keys
1. In Supabase, go to **Settings → API**
2. Copy **Project URL** — looks like `https://abcxyz.supabase.co`
3. Copy **anon public** key — a long string starting with `eyJ...`
4. Keep these — you'll need them in Step 3

### Create your first staff login
1. In Supabase, go to **Authentication → Users**
2. Click **Add user → Create new user**
3. Enter your school email and a password
4. Click **Create user**

---

## Step 2 — Set up the project on your computer

Open Terminal (Mac) or Command Prompt (Windows) and run:

```bash
# Go into the project folder
cd dav-school

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
```

Now open the `.env` file in any text editor and fill in your keys:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Test it locally:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) — you should see the login screen.

---

## Step 3 — Deploy to Vercel (go live)

### Option A: Easiest — via GitHub (recommended)

1. Go to [github.com](https://github.com) → create a free account
2. Create a new repository called `dav-school` (set to Private)
3. In your project folder, run:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/dav-school.git
   git push -u origin main
   ```
4. Go to [vercel.com](https://vercel.com) → sign up with GitHub
5. Click **Add New Project** → import your `dav-school` repo
6. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
7. Click **Deploy**

Your app will be live at `https://dav-school.vercel.app` (or similar) in ~1 minute!

---

## Step 4 — Share with your staff

1. Send them the Vercel URL
2. Add each staff member in Supabase → Authentication → Users
3. They log in with their email and password

---

## How to update the software later

Whenever you make changes to the code:
```bash
git add .
git commit -m "describe your change"
git push
```
Vercel automatically re-deploys within ~30 seconds.

---

## Features included

| Feature | Description |
|---|---|
| Secure login | Email + password, only registered staff can access |
| Add students | Full form with all fields |
| Edit records | Click the pencil icon on any row |
| Delete records | With confirmation dialog |
| Search | By name, admission no., father's name, caste |
| Filter by class | Dropdown filter |
| TC tracking | Date issued, shown as green badge |
| Stats dashboard | Total, active, TC issued, number of classes |
| CSV export | Download all records as Excel-compatible file |
| Responsive | Works on mobile and tablet too |

---

## Need help?

Common issues:

**"Invalid login credentials"** — Check that you created a user in Supabase → Authentication → Users

**"Missing Supabase URL"** — Make sure your `.env` file has the correct values with no extra spaces

**Table shows no data** — Make sure you ran the SQL from `supabase_setup.sql` in the Supabase SQL Editor

---

*Built for D.A.V. Mukhyamantri Public School, Ulloor Bhopalpatnam*

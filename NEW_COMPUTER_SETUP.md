# GrantLink: New Computer Setup Guide

## What you actually need to transfer

Most of your project lives on GitHub and Vercel already, so the migration is simpler than you might think. The only things that aren't in the cloud are your local environment secrets.

## Before you leave the old computer

### 1. Push any uncommitted work to GitHub

Open your terminal in the grantlink folder and run:

```bash
git status
```

If there are uncommitted changes, commit and push them:

```bash
git add -A
git commit -m "Latest changes before computer transfer"
git push origin main
```

### 2. Copy your environment secrets

This is the one thing GitHub doesn't have. Open the file `.env.local` in your project root and copy its contents somewhere safe (password manager, encrypted note, etc.). Here's what's in it:

- `RESEND_API_KEY` — your email sending key
- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your Supabase public key
- `SUPABASE_SERVICE_ROLE_KEY` — your Supabase admin key (keep this one very secure)
- `CRON_SECRET` — your cron job authentication secret

You can also grab these from your Vercel dashboard later if you lose them (Settings > Environment Variables), but it's easier to have them on hand.

**Important:** Do NOT copy `.env.local.save` to the new machine. It's a stale backup you should delete anyway (per the security audit).

### 3. Optional: copy to external hard drive

If you want a local backup beyond GitHub, copy the entire `grantlink` folder to your external drive. But honestly, since everything is on GitHub, you can skip this step. The only files not in the repo are `.env.local` (which you're saving separately) and `node_modules` (which gets regenerated).

## On the new computer

### 4. Install your tools

Install these in order:

**Node.js** — download from https://nodejs.org (use the LTS version)

Verify it worked:
```bash
node --version
npm --version
```

**Git** — download from https://git-scm.com (or it may already be installed on macOS)

Verify:
```bash
git --version
```

**Claude** — download Claude desktop from https://claude.ai/download

**A code editor** — VS Code, Cursor, or whatever you prefer

### 5. Configure Git with your identity

```bash
git config --global user.name "Drew Yukelson"
git config --global user.email "drew.yukelson@gmail.com"
```

### 6. Authenticate with GitHub

The easiest way is GitHub CLI:

```bash
# Install GitHub CLI
# macOS:
brew install gh
# Or download from https://cli.github.com

# Then log in:
gh auth login
```

Follow the prompts. It will open a browser to authenticate.

### 7. Clone the project

```bash
cd ~/Documents
gh repo clone dcyuke/grantlink2 grantlink
cd grantlink
```

### 8. Install dependencies

```bash
npm install
```

This will regenerate the entire `node_modules` folder from `package-lock.json`. Takes a minute or two.

### 9. Recreate your environment file

Create a new `.env.local` file in the project root with the secrets you saved in step 2:

```bash
touch .env.local
```

Then open it in your editor and paste in your environment variables. It should look like this:

```
RESEND_API_KEY=re_your_key_here
NEXT_PUBLIC_SUPABASE_URL=https://ropbumeuuddufswrjfva.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
CRON_SECRET=your_cron_secret_here
```

### 10. Verify everything works

Start the dev server:

```bash
npm run dev
```

Then open http://localhost:3000 in your browser. You should see the GrantLink homepage. Try logging in to make sure Supabase auth is working.

### 11. Set up Vercel CLI (optional)

If you use the Vercel CLI for deployments:

```bash
npm install -g vercel
vercel login
vercel link
```

This connects your local project to your Vercel deployment. But if you just push to GitHub and let Vercel auto-deploy, you can skip this.

## Checklist

- [ ] All changes pushed to GitHub from old computer
- [ ] Environment secrets saved securely
- [ ] Node.js installed on new computer
- [ ] Git installed and configured
- [ ] GitHub authenticated
- [ ] Project cloned
- [ ] npm install completed
- [ ] .env.local created with secrets
- [ ] Dev server runs successfully
- [ ] Can log in and use the app locally

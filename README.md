# Live Demo
https://search-sync.site

# SearchSync

A job application tracker where you can linked your gmail account using the GMAIL API. SearchSync reads your emails from your gmail account, filters them into 4 different categories (Applied/Interview/Rejected/Offer) based on certain keywords inside the emails. 

# Features

- Column view and compact list view, with search by company and filtering by status
- Add, edit and delete applications, and change status inline
- One-click Gmail sync that finds application-related emails and creates entries without duplicates
- Jump from an application straight to its source email in Gmail
- Registration and login, with every user's data kept private to them
- Responsive layout for mobile, tablet and desktop

# Teck Stack

AWS | TypeScript/JavaScript | Express.js(Node.js framework) | Node.js | Tailwind CSS | PostgreSQL | React.js

# Services used for deployment

Backend: AWS EC2
Frontend: Vercel

## Getting started
 
### Prerequisites
 
- Node.js (current LTS) and npm
- PostgreSQL
- A Google Cloud project with the Gmail API enabled

### 1. Clone and install
 
```bash
git clone https://github.com/Azure2009/Job-Application-Tracker.git
cd Job_Application_Tracker
 
cd backend && npm install
cd ../frontend && npm install
```
 
### 2. Create the database
 
```bash
createdb job_tracker
psql "postgresql://USER:PASSWORD@localhost:5432/job_tracker" -f backend/schema.sql
```
 
The `sessions` table is created automatically the first time the server starts.
 
### 3. Set up Google OAuth
 
1. In Google Cloud Console, enable the **Gmail API**.
2. Configure the OAuth consent screen, keep it in **Testing** mode, and add your own Google account as a test user.
3. Create an **OAuth client ID** of type *Web application* and add this authorised redirect URI: `http://localhost:3000/auth/google/callback`
### 4. Configure environment variables
 
`backend/.env`:
 
```bash
NODE_ENV=development
SESSION_SECRET=replace-with-a-long-random-string
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/job_tracker
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```
 
Generate a session secret with:
 
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
 
`frontend/.env`:
 
```bash
VITE_API_URL=http://localhost:3000
```
 
### 5. Run it
 
```bash
# terminal 1
cd backend && npm run dev
 
# terminal 2
cd frontend && npm run dev
```
 
Open http://localhost:5173, create an account, and connect your Gmail from the dashboard.

## Known limitations
 
- **Gmail sync only works for accounts added as test users.** The Gmail scope is restricted, and verifying an app for it is outside the scope of a portfolio project. For apps in testing mode, Google can also expire refresh tokens after about a week, so you may need to reconnect.
- **Email classification is keyword-based.** It looks at subject lines only and will misclassify some emails, so status can always be changed by hand.
- **Sync is capped.** It reads up to 50 recent primary-tab emails matching job-related subjects after a fixed start date.
- **One Gmail account per user**, and a Gmail account can be linked to only one SearchSync account.

## AI assistance
 
I needed ideas and help from Claude(Sonnet 5.5) on the authentication and OAuth design. The frontend api calls and most api endpoints was all my idea and was handwritten by me. The frontend design was all my idea and handwritten by me.

## Author
 
Juan Carlo · [GitHub](https://github.com/Azure2009) · [LinkedIn](https://www.linkedin.com/in/juan-carlo-abalajon)
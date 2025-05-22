# TimeForge (Persona)

**TimeForge** is an AI-powered goal tracker and scheduler designed to help individuals take control of their time, stay productive, and meet their personal goals with precision. Built with a modern tech stack including React, Node.js, Prisma, and Gemini API.

[View Live Site](https://timeforge-eight.vercel.app)

## Features

- **AI-Enhanced Planning** – Breaks down goals into actionable steps with deadlines
- **24/7 Personal Scheduler** – Supports full-week and round-the-clock event planning
- **Google Authentication** – Seamless login with OAuth
- **Goal Tracking** – Monitor progress and track completion status
- **Event Notifications** – Sends reminders 10 minutes before any event
- **Adaptive Suggestions** – Prompts for alternative activities when goals are missed
- **Special Event Detection** – Automatically identifies and highlights significant events

## Tech Stack

- **Frontend**: React, Tailwind CSS, React Router, Vite
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Prisma ORM)
- **AI Integration**: Gemini API
- **Authentication**: Google OAuth
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL
- Vercel CLI (for deployment)

### Installation

```bash
# Clone the repo
git clone https://github.com/satoru707/Persona.git
cd Persona

# Install dependencies
npm install

# Set up your environment
cp .env.example .env
# Fill in your environment variables (DB URL, Gemini API key, etc.)

# Start the development server
npm run dev

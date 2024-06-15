# Membly

Use your browser history as a knowledge base

## Server setup
- Install ollama and start it
- Install postgres (on Mac I recommend https://postgresapp.com/)
- Create a user to access the database `CREATE USER membly WITH PASSWORD 'password'`
- Create a database `membly` owned by the above user: `CREATE DATABASE membly OWNER membly;`
- Connect to the database and then enable pgvector: `CREATE EXTENSION IF NOT EXISTS vector;`
- Update access string in `.env` file: `POSTGRES_URI=postgres://username:password@127.0.0.1:5432/membly`

## Use membly
- Start the server `cd server && npm i && npm run dev`
- Start the web app `cd web && npm i && npm run dev`
- Install the browser extension
- All web pages are now captured on load
- Click on the extension to open the search page

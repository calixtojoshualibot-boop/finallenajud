# NBA Caps Vault — Fixed Project

This version fixes the broken TypeScript types, backend API, database setup, admin/user functions, and build/start errors.

## Run locally using the built-in fallback database

```bash
npm install
npm run typecheck
npm run build
npm start
```

Open: `http://localhost:3000`

Default admin login:

```text
Email: admin@caps.ph
Password: admin123
```

When no MySQL `.env` is configured, the server automatically uses `database.json` so the project still runs without crashing.

## Run with MySQL / XAMPP

1. Create a database in phpMyAdmin named `nba_vault`.
2. Import `database.sql` into that database.
3. Copy `.env.example` to `.env`.
4. Edit `.env` if needed:

```env
PORT=3000
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=nba_vault
MYSQL_SSL=false
```

5. Run:

```bash
npm install
npm run build
npm start
```

## Working features checked

- admin login
- user registration/login
- product listing
- add/edit/delete cap records
- upload cap image as base64
- seller contact settings
- user cart and checkout
- order creation
- admin order status update
- user list display
- API health check at `/api/health`

## Important notes

- The old `api.php` file is no longer required for the React app. The app uses the Node/Express backend in `server.js`.
- Passwords are stored plainly because the original school project used plain login checks. For a real deployment, hash passwords before saving them.

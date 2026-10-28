# Sign-Up App – React, Express, REST API, MongoDB

```
signup-app/
├── server/                 Express API + MongoDB
│   ├── .env.example        copy to .env and set MONGODB_URI
│   ├── package.json
│   └── src/
│       ├── server.js       app setup, middleware, error handling
│       ├── config/db.js    MongoDB connection
│       ├── models/User.js  User schema (email, hashed password)
│       └── routes/auth.js  signup + login endpoints
└── client/                 React (Vite)
    ├── index.html
    ├── vite.config.js      proxies /api to the Express server
    └── src/
        ├── App.jsx
        ├── api.js          fetch helper
        ├── components/AuthForm.jsx   Sign Up / Log In form
        ├── index.css       styling to match the design
        └── main.jsx
```

## Run it

You need Node.js 18+ and a MongoDB database (see below).

**1. Start the API**
```
cd server
npm install
cp .env.example .env      # Windows: copy .env.example .env
# edit .env and set MONGODB_URI
npm run dev               # or: npm start
```
You should see `MongoDB connected: ...` and `API running at http://localhost:5000`.

**2. Start the React app** (in a second terminal)
```
cd client
npm install
npm run dev
```
Open http://localhost:5173

## REST API

| Method | Endpoint             | Body                    | Success | Errors                  |
|--------|----------------------|-------------------------|---------|-------------------------|
| POST   | /api/auth/signup     | `{ email, password }`   | 201     | 400 invalid input, 409 email taken |
| POST   | /api/auth/login      | `{ email, password }`   | 200     | 400 invalid input, 401 wrong credentials |

Example:
```
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"secret123"}'
```

Rules: valid email, password 8–72 characters, emails are stored lowercase and each email can only sign up once.
Passwords are hashed with bcrypt before saving, and the hash is never returned by the API.

---

## Connecting MongoDB

The server reads one setting, `MONGODB_URI`, from `server/.env`. Pick one option.

### Option A: MongoDB Atlas (cloud, free tier)

1. Go to https://www.mongodb.com/cloud/atlas, sign up, and create a **free M0 cluster**.
2. **Database Access** (left menu) → *Add New Database User* → choose username and password (password auth). Save them.
3. **Network Access** → *Add IP Address* → *Allow access from anywhere* (`0.0.0.0/0`). This is fine for coursework.
4. Click **Connect** on your cluster → *Drivers* → *Node.js*. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. In `server/.env`, paste it as `MONGODB_URI`, replace `<password>` with your real password, and add the database name before the `?`:
   ```
   MONGODB_URI=mongodb+srv://myuser:mypass@cluster0.xxxxx.mongodb.net/signup_app?retryWrites=true&w=majority
   ```
   If your password contains characters like `@`, `:`, `/` or `#`, URL-encode them (for example `@` becomes `%40`).
6. Run `npm run dev` in `server/`. After the first sign-up, Atlas → *Browse Collections* shows the `signup_app` database with a `users` collection.

### Option B: MongoDB on your own computer

- **Install MongoDB Community Server** from https://www.mongodb.com/try/download/community and start it (it runs on port 27017 by default). Or with Docker:
  ```
  docker run -d --name mongo -p 27017:27017 mongo:7
  ```
- In `server/.env`:
  ```
  MONGODB_URI=mongodb://127.0.0.1:27017/signup_app
  ```
- To look at your data, install **MongoDB Compass** and connect to the same URI.

### Troubleshooting

| Message | Fix |
|---------|-----|
| `MONGODB_URI is not set` | Create `server/.env` from `.env.example`. |
| `MongoDB connection failed: bad auth` | Wrong username or password in the URI. |
| `ENOTFOUND` / `querySrv` errors | Check the Atlas host name; make sure the cluster is running. |
| `Could not connect to any servers` / `ECONNREFUSED` (local) | MongoDB isn't running. Start it or the Docker container. |
| Atlas times out | Add your IP in *Network Access*, or allow `0.0.0.0/0`. |
| Browser shows "Cannot reach the server" | The Express server isn't running on port 5000. |

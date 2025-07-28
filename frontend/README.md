# Deployment Instructions

## Frontend (Netlify)
1. Push your frontend code to a GitHub repository.
2. Go to [Netlify](https://app.netlify.com/) and create a new site from Git.
3. Set the environment variable `REACT_APP_API_URL` to your Render backend URL (e.g., `https://your-backend.onrender.com`).
4. Deploy the site.

## Backend (Render)
1. Push your backend code to a GitHub repository.
2. Go to [Render](https://dashboard.render.com/) and create a new Web Service from your repo.
3. Set the build and start commands as needed (e.g., `npm install` and `node server.js`).
4. Deploy the backend.

## Notes
- Make sure CORS is enabled on your backend for your Netlify domain.
- Update the API URL in Netlify if your Render backend URL changes. 
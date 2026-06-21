📍 Mekan

Local Venue Review Platform — a full-stack web application for discovering nearby places on an interactive map, powered by AI-driven review analysis and a transparent satisfaction scoring system.

Users explore nearby venues on the map, leave star ratings and written reviews, and the system runs every review through Google Gemini (with a local Turkish sentiment engine as a fallback) to produce a dynamic satisfaction score for each place. The admin panel provides full moderation control along with AI-generated reply suggestions for customer reviews.


✨ Features

User-Facing


🗺️ Interactive Map — proximity-based venue search built on Leaflet + OpenStreetMap (auto-refreshes as the map is panned)
📍 Location-Based Discovery — uses the browser Geolocation API to surface venues near the user
⭐ Reviews & Ratings — 1–5 star rating system with free-text comments
🤖 AI-Powered Satisfaction Score — a weighted score per venue combining star ratings, AI sentiment, and positive/negative review ratio
🏆 Ranking — compare venues by satisfaction score
📈 Trending Places — venues with the strongest positive momentum over the last 7 days
🥇 Place of the Month — automatically computed monthly highlight of the top-scoring venue
❤️ Favorites — logged-in users can save venues to a personal list
🌍 Multi-language Support — Turkish / English (JSON-based i18n system)
🔐 User Authentication — JWT-based registration and login


Admin Panel


🛡️ Moderation — approve, edit, or delete reviews
🚩 Automatic Flagging — detects profanity, spam, threats, and inappropriate content
💬 AI Reply Suggestions — Gemini generates a tailored, professional draft reply for any review, written from the venue's perspective
📊 Analytics Dashboard — Chart.js visualizations for satisfaction distribution and review timeline


Security


🔑 Password hashing with bcrypt (cost factor 12)
⏱️ Timing-attack mitigation — admin login compares against a dummy hash even when no matching user exists, keeping response time constant
🚦 Per-endpoint rate limiting (separate limits for general traffic, login attempts, and review submissions)
🧱 helmet for HTTP security headers and a strict CORS policy
✅ Server-side input validation via express-validator
🛡️ Prompt injection mitigation — review text sent to Gemini is wrapped in explicit delimiter tags (YORUM_BASLANGIC / YORUM_BITIS) to isolate user input from the instruction prompt
🌐 IP hashing — raw reviewer IP addresses are never stored in the database



🛠️ Tech Stack

LayerTechnologiesBackendNode.js, Express 4, MongoDB (Mongoose 8)AuthenticationJSON Web Tokens (JWT), bcryptjsAI / NLPGoogle Generative AI (Gemini 2.0 Flash), sentiment npm package + custom Turkish lexicon (fallback)Securityhelmet, express-rate-limit, express-validatorFrontendVanilla JavaScript (ES6+, modular structure), HTML5, CSS3MapLeaflet.js + OpenStreetMap tilesChartsChart.jsi18nCustom JSON-based translation system (tr/en)


📂 Project Structure

Mekan/
├── backend/
│   ├── config/
│   │   ├── db.js                # MongoDB connection
│   │   └── seed.js               # Creates the initial admin user
│   ├── controllers/
│   │   ├── admin/                # Moderation, login, AI reply suggestion
│   │   ├── auth/                 # Register, login, profile
│   │   ├── comment/               # Review creation & listing
│   │   ├── favorite/               # Add/remove favorites
│   │   └── stats/                 # Ranking, trending, place of the month
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification + admin role check
│   │   ├── rateLimiter.js         # Per-endpoint rate limiting
│   │   └── validation.js          # express-validator rules
│   ├── models/                    # User, Comment, Favorite (Mongoose schemas)
│   ├── routes/                    # Express route definitions
│   ├── services/
│   │   ├── aiService.js           # Local sentiment fallback engine
│   │   ├── geminiService.js       # Gemini API integration (analysis + reply suggestion)
│   │   ├── statsService.js        # Score calculation, ranking, timeline
│   │   ├── commentService.js
│   │   ├── favoriteService.js
│   │   ├── jwtService.js
│   │   └── errorLogger.js
│   └── server.js                  # Application entry point
│
└── frontend/
    ├── css/                       # Page-specific stylesheets
    ├── js/
    │   ├── api.js                 # Centralized fetch wrapper (timeout, 401 handling)
    │   ├── config.js              # Environment-aware BASE_URL resolution
    │   ├── app.js / navbar.js / i18n.js / favorites.js / charts.js
    │   ├── auth/                  # login.js, register.js
    │   ├── map/                   # mapInit, mapMarkers, mapSearch
    │   ├── panel/                 # panelUI, panelStats, panelRanking
    │   └── comments/              # commentsForm, commentsList
    └── public/            

    🤖 AI Architecture: Hybrid Sentiment Analysis

To avoid a single point of failure, Mekan runs a two-tier analysis pipeline:


Primary tier — Google Gemini (2.0 Flash): every new review is sent to Gemini with a strict JSON-schema instruction. The model returns a sentiment label, a 0–100 satisfaction score, and a content flag (profanity / spam / threat / inappropriate).
Fallback tier — local lexicon engine: if the Gemini request fails, the response doesn't pass schema validation, or no API key is configured, the system automatically falls back to the sentiment npm package extended with a custom Turkish positive/negative word lexicon. This keeps the platform fully functional even during a third-party outage.


The final per-venue satisfaction score is a weighted average of three components:

satisfactionPct = (avg_AI_score × 0.4) + (star_rating_pct × 0.4) + (positive_ratio × 0.2)

🚀 Getting Started

Prerequisites


Node.js ≥ 18
MongoDB (local instance or MongoDB Atlas)
A Google Gemini API key (free via Google AI Studio)


1. Clone the repository

bashgit clone https://github.com/<your-username>/Mekan.git
cd Mekan

2. Backend setup

bashcd backend
npm install
cp .env.example .env

Fill in your .env file:

envPORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/mekan_db

# Generate at least a 32-character random secret:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_strong_random_secret
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=your_gemini_api_key

ADMIN_USERNAME=admin
ADMIN_PASSWORD=a_strong_password

Create the initial admin user:

bashnpm run seed

Start the server:

bashnpm run dev      # development mode with nodemon
# or
npm start        # production mode

The API runs on http://localhost:5000 by default. Health check:

bashcurl http://localhost:5000/api/health

3. Frontend setup

The frontend requires no build step (plain HTML/CSS/JS). Serve the frontend/public folder with any static file server:

bashcd frontend/public
npx serve .
# or the VS Code "Live Server" extension (port 5500)


frontend/js/config.js automatically points to http://localhost:5000/api when running on localhost/127.0.0.1, and falls back to /api in production — so it's recommended to serve the frontend and backend behind the same domain via a reverse proxy in production.




📡 API Endpoints (Summary)

MethodEndpointDescriptionAuthPOST/api/auth/registerRegister a new userPublicPOST/api/auth/loginUser loginPublicGET/api/auth/meGet current user infoJWTGET/api/comments/:placeIdGet approved reviews for a venuePublicPOST/api/commentsSubmit a new reviewJWT, rate-limitedGET/api/stats/:placeIdVenue stats + review timelinePublicGET/api/stats/rankingVenue rankingPublicGET/api/stats/trendingTrending venues (last 7 days)PublicGET/api/stats/place-of-monthPlace of the monthPublicGET/api/favoritesGet the user's favoritesJWTPOST/api/favoritesAdd a favoriteJWTDELETE/api/favorites/:placeIdRemove a favoriteJWTPOST/api/admin/loginAdmin loginPublic, rate-limitedGET/api/admin/commentsList all reviewsAdminPUT/api/admin/comments/:idEdit a reviewAdminDELETE/api/admin/comments/:idDelete a reviewAdminPOST/api/admin/comments/:id/approveApprove a reviewAdminPOST/api/admin/comments/:id/suggest-replyGenerate an AI reply suggestionAdmin


🗺️ Roadmap


 Venue image uploads
 Notification system (new reviews/replies)
 Social login (Google OAuth)
 One-command setup with Docker Compose
 Unit/integration test suite (Jest)



🤝 Contributing


Fork this repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'feat: add amazing feature')
Push to your branch (git push origin feature/amazing-feature)
Open a Pull Request



📄 License

No license has been chosen for this project yet. Please contact the project owner before use.

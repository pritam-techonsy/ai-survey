# AI Survey Project

This project provides an AI-powered survey generation and response collection system.

## Prerequisites
- Node.js and npm installed
- A running MongoDB instance (local or remote)

## Setup
1. Clone this repository or place these files in a folder.
2. Navigate into the project directory:
   ```
   cd /c:/Users/pritam-techonsy/Documents/html/ai-survey
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the project root with the following variables:
   ```
   MONGO_USER=user
   MONGO_PASS=pass
   MONGO_DB=ai-survey
   GROK_API_KEY=YOUR_GROK_API_KEY
   SENDER_EMAIL=YOUR_SENDING_EMAIL
   SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY
   ```
   *Note:* Adjust the MongoDB credentials as per your setup. The application uses these variables to build the MongoDB connection URI.
5. Start the server:
   ```
   npm start
   ```
6. Open a browser and navigate to:
   ```
   http://localhost:3000
   ```

## Folder Structure
- **config/** – Contains configuration files, e.g., database connection (`db.js`).
- **models/** – Contains Mongoose schemas (Survey, SurveyResponse).
- **routes/** – Contains route definitions (if separated in the future).
- **public/** – Contains static assets (HTML, CSS, client-side JS).
- **app.js** – Main application file that sets up routes, middleware, and starts the server.
- **package.json** – Project metadata and dependencies.
- **README.md** – Setup and project overview.

## Usage
- Visit `/index.html` to generate a new survey.
- Visit `/surveys.html` to view a dashboard of all surveys and their response counts.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Troubleshooting
- If you encounter issues connecting to MongoDB, ensure your `.env` variables are correct and that your MongoDB instance is running.
- Check the console output for any errors related to environment variable configuration.

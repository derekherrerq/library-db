## Overview of the Application

This Library Database application is built using React and aims to manage a library's resources effectively. It allows tracking of books, user records, and borrowing activities, making it suitable for small to medium library management systems.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). It is a library database application designed to manage book inventory, user records, and borrowing activities.

## Prerequisites

Ensure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed. This project also uses [Vercel CLI](https://vercel.com/docs/cli) for local development.

## Setup

1. **Install Dependencies**  
   In the project directory, run the following command to install all required packages:

   ```bash
   npm install
   ```

2. **Environment Variables**  
   Create a `test.env` file in the root directory and define the following environment variables required for database connection:

   ```plaintext
   DB_HOST=
   DB_PORT=
   DB_USER=
   DB_PASSWORD=
   DB_NAME=
   ```

   Replace the placeholders with your database connection details.

## Available Scripts

In the project directory, you can run:


### `vercel dev`

Starts the application using Vercel's development environment, which simulates the production build locally. Ensure that you have the Vercel CLI installed and set up.

### `npm test`

Launches the test runner in interactive watch mode.See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified, and the filenames include the hashes.Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
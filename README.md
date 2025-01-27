# SplitWise

A simple expense-sharing application.

## Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/tanuj-saini/SplitWise.git
    cd splitwise
    ```

2. Install the dependencies:

    ```sh
    npm install
    ```

3. Set up the environment variables. Create a `.env` file in the root directory and add the following variables:

    ```env
    PORT=8080
    MONGO_URL=your_mongodb_connection_string
    CORS_ORIGIN=your_cors_origin
    ACCESS_TOKEN_SECRET=your_access_token_secret
    REFRESH_TOKEN_SECRET=your_refresh_token_secret
    ACCESS_TOKEN_EXPIRY=your_access_token_expiry
    REFRESH_TOKEN_EXPIRY=your_refresh_token_expiry
    ```

4. Start the development server:

    ```sh
    npm run dev
    ```

## Docker Setup

This application can also be run using Docker. Follow these steps:

1. Pull the Docker image from Docker Hub:

    ```sh
    docker pull tanujsaini/splitwise-backend
    ```

2. Create a `.env` file in the root directory with the following variables:

    ```env
    PORT=8080
    MONGO_URL=your_mongodb_connection_string
    CORS_ORIGIN=your_cors_origin
    ACCESS_TOKEN_SECRET=your_access_token_secret
    REFRESH_TOKEN_SECRET=your_refresh_token_secret
    ACCESS_TOKEN_EXPIRY=your_access_token_expiry
    REFRESH_TOKEN_EXPIRY=your_refresh_token_expiry
    ```


3. Start the application using Docker Compose:

    ```sh
    docker-compose up -d
    ```

4. The application will be accessible at `http://localhost:8080`.

## Usage

To start the application without Docker, run:

```sh
npm start

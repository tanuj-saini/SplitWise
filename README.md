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

## Jenkins Setup

This application can be built and deployed using Jenkins. Follow these steps:

1. **Set Up Jenkins Pipeline**:
    Create a new pipeline job in Jenkins.
    Use the following pipeline script:

2. **Configure Environment Variables**:
    Replace the empty values in the environment block with your actual environment variables.
    

3. **Run the Pipeline**:
   Save the pipeline configuration and run the job.
   The pipeline will:
    - Checkout the code from the main branch.
    - Print debug information about the branch.
    - Print debug information about the branch.
    


## Usage

To start the application without Docker, run:

```sh
npm start

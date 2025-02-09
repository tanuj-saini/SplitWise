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
    
## Kubernetes Setup

This application can also be deployed using Kubernetes. Follow these steps:

1. **Create Kubernetes Deployment and Service Files**:
    Create a `deployment.yaml` file with the following content:

    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: splitwise-deployment
    spec:
      replicas: 3
      selector:
        matchLabels:
          app: splitwise
      template:
        metadata:
          labels:
            app: splitwise
        spec:
          containers:
          - name: splitwise
            image: tanujsaini/splitwise-backend
            ports:
            - containerPort: 8080
            env:
            - name: PORT
              value: "8080"
            - name: MONGO_URL
               value: "your_mongodb_connection_string"
            - name: CORS_ORIGIN
              value: "your_cors_origin"
            - name: ACCESS_TOKEN_SECRET
              value: "your_access_token_secret"
            - name: REFRESH_TOKEN_SECRET
              value: "your_refresh_token_secret"
            - name: ACCESS_TOKEN_EXPIRY
              value: "your_access_token_expiry"
            - name: REFRESH_TOKEN_EXPIRY
              value: "your_refresh_token_expiry"
    ```

    Create a `service.yaml` file with the following content:

    ```yaml
    apiVersion: v1
    kind: Service
    metadata:
      name: splitwise-service
    spec:
      selector:
        app: splitwise
      ports:
       - protocol: TCP
          port: 80
          targetPort: 8080
      type: LoadBalancer
    ```
2. **Deploy to Kubernetes**:
    Apply the deployment and service files to your Kubernetes cluster:

    ```sh
    kubectl apply -f deployment.yaml
    kubectl apply -f service.yaml
    ```

3. **Access the Application**:
    The application will be accessible at the external IP address of the LoadBalancer service. You can get the external IP address by running:

    ```sh
    kubectl get services
    ```


## Usage

To start the application without Docker, run:

```sh
npm start

pipeline {
    agent any

    environment {
        // Define your environment variables here
        PORT = '8080'
        MONGO_URL = 'mongodb+srv://medeaszzz:YVZdlBODuGtzQwPf@cluster0.ijdak.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
        CORS_ORIGIN = '*'
        ACCESS_TOKEN_SECRET = '1234567890'
        REFRESH_TOKEN_SECRET = '0987654321'
        ACCESS_TOKEN_EXPIRY = '1d'
        REFRESH_TOKEN_EXPIRY = '10d'
        REDIS_HOST = 'caching-3003077a-lokhanderohit2020-0d67.f.aivencloud.com'
        REDIS_PORT = '20071'
        REDIS_USERNAME = 'default'
        REDIS_PASSWORD = 'AVNS_EfTD1r7Qtv0lh9cvkXX'
        KAFKA_BROKER = 'kafka-cc0288c-lokhanderohit2020-0d67.f.aivencloud.com:20084'
        KAFKA_SASL_USERNAME = 'avnadmin'
        KAFKA_SASL_PASSWORD = 'AVNS_k5Y-uXYXw3Qb6hrsw_v'
        KAFKA_SSL_CA_PATH = './ca.cer'
        PATH = "/usr/local/bin:${env.PATH}"
        
        
        // NODE_ENV = 'production' // Uncomment if needed
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', 
                url: 'https://github.com/tanuj-saini/SplitWise.git'
            }
        }

        // Add a debug stage to print branch info
        stage('Debug') {
            steps {
                script {
                    echo "GIT_BRANCH: ${env.GIT_BRANCH}"
                    echo "BRANCH_NAME: ${env.BRANCH_NAME}"
                    // Get the actual branch name using a shell command
                    sh 'git branch --show-current'
                }
            }
        }

        stage('Build') {
            when {
                // Use a regex to match the branch name
                expression { 
                    env.GIT_BRANCH == 'origin/main' || 
                    env.BRANCH_NAME == 'main' ||
                    sh(returnStdout: true, script: 'git rev-parse --abbrev-ref HEAD').trim() == 'main'
                }
            }
            steps {
                sh 'node --version'
                sh 'npm --version'
                // Install dependencies and run
                
                sh 'npm install'
                sh 'node src/index.js'
            }
        }
    
}
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
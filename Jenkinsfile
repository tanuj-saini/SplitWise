pipeline {
    agent any

    environment {
        // Define your environment variables here
        PORT = ''
        MONGO_URL = ''
        CORS_ORIGIN = '*'
        ACCESS_TOKEN_SECRET = ''
        REFRESH_TOKEN_SECRET = ''
        ACCESS_TOKEN_EXPIRY = ''
        REFRESH_TOKEN_EXPIRY = ''
        REDIS_HOST = ''
        REDIS_PORT = ''
        REDIS_USERNAME = ''
        REDIS_PASSWORD = ''
        KAFKA_BROKER = ''
        KAFKA_SASL_USERNAME = ''
        KAFKA_SASL_PASSWORD = ''
        KAFKA_SSL_CA_PATH = './ca.cer'
        PATH = "/usr/local/bin:${env.PATH}"//Node Path
        
        
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
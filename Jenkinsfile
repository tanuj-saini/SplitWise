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
        PATH = "/usr/local/bin:${env.PATH}"//Node
        
        
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
        
      stage('Send File To ansible Server') {
    steps {
        sshagent(['docker-split']) {
            sh '''
            # Remove the existing SplitWise folder on the remote server if it exists
            ssh -o StrictHostKeyChecking=no rohit@192.168.1.16 "if [ -d /home/rohit/Server/SplitWise ]; then rm -rf /home/rohit/Server/SplitWise; fi"
            
            # Copy the local SplitWise folder to the remote server
            scp -r -o StrictHostKeyChecking=no /Users/tanujsaini/Desktop/SplitWise rohit@192.168.1.16:/home/rohit/Server
            
            # After the folder is copied, copy the node_modules folder from its location on the server
            ssh -o StrictHostKeyChecking=no rohit@192.168.1.16 "cp -r /home/rohit/Desktop/node_modules /home/rohit/Server/SplitWise/"
            '''
        }
    }
}

stage('Docker Build Image') {
    steps {
        sshagent(['docker-split']) {
            sh '''
            ssh -o StrictHostKeyChecking=no rohit@192.168.1.16 "cd /home/rohit/Server/SplitWise && docker build --progress=plain -t splitserver:v1.$BUILD_ID ."
            '''
        }
    }
}


stage('Docker Image Tagging') {
    steps {
        sshagent(['docker-split']) {
           
          sh 'ssh -o StrictHostKeyChecking=no rohit@192.168.1.16 cd /home/rohit/Server/SplitWise'
          sh 'ssh -o StrictHostKeyChecking=no rohit@192.168.1.16 docker image tag splitserver:v1.$BUILD_ID serverhyper/splitserver:v1.$BUILD_ID '
          sh 'ssh -o StrictHostKeyChecking=no rohit@192.168.1.16 docker image tag splitserver:v1.$BUILD_ID serverhyper/splitserver:latest '
           
           
        }
    }
}
stage('Push Docker Image to DockerHub') {
    steps {
        sshagent(['docker-host']) {
            withCredentials([string(credentialsId: 'e5b22b94-57be-4d32-b128-2db30ebeb6e5', variable: 'dockerhub_passwd')]) {
    // some block

           
          sh "docker login -u serverhyper -p ${dockerhub_passwd}"
          sh 'ssh -o StrictHostKeyChecking=no rohit@192.168.1.16 cd /home/rohit/Server/SplitWise'
          sh 'ssh -o StrictHostKeyChecking=no rohit@192.168.1.16 docker image push serverhyper/splitserver:v1.$BUILD_ID '
          sh 'ssh -o StrictHostKeyChecking=no rohit@192.168.1.16 docker image push serverhyper/splitserver:latest '
          sh 'ssh -o StrictHostKeyChecking=no rohit@192.168.1.16 docker image rm serverhyper/splitserver:v1.$BUILD_ID serverhyper/splitserver:latest splitserver:v1.$BUILD_ID'
          
          
            }
           
        }
    }
}
stage('Kubernetes Deplyment to ansible Server') {
    steps {
        sshagent(['docker-split']) {
             sh 'ssh -o StrictHostKeyChecking=no rohit@192.168.1.16 "cd /home/rohit/Server/SplitWise && ansible-playbook ansible.yml"'

              
          
        }
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
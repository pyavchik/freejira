pipeline {
    agent any
    
    environment {
        SERVER_IP = '70.34.254.102'
        SERVER_USER = 'root'
        DEPLOY_PATH = '/root/freejira'
        NODE_VERSION = '18'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from GitHub...'
                checkout scm
                sh 'git pull origin main'
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            echo 'Installing backend dependencies...'
                            sh 'npm ci'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            echo 'Installing frontend dependencies...'
                            sh 'npm ci'
                        }
                    }
                }
            }
        }
        
        stage('Build') {
            steps {
                dir('frontend') {
                    echo 'Building frontend...'
                    sh 'npm run build'
                }
            }
        }
        
        stage('Setup Environment') {
            steps {
                script {
                    echo 'Setting up remote environment...'
                    withCredentials([
                        string(credentialsId: 'MONGO_URI', variable: 'MONGO_URI'),
                        string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
                        string(credentialsId: 'JWT_EXPIRE', variable: 'JWT_EXPIRE'),
                        string(credentialsId: 'GOOGLE_CLIENT_ID', variable: 'GOOGLE_CLIENT_ID'),
                        string(credentialsId: 'GOOGLE_CLIENT_SECRET', variable: 'GOOGLE_CLIENT_SECRET'),
                        string(credentialsId: 'EMAIL_HOST', variable: 'EMAIL_HOST'),
                        string(credentialsId: 'EMAIL_PORT', variable: 'EMAIL_PORT'),
                        string(credentialsId: 'EMAIL_USER', variable: 'EMAIL_USER'),
                        string(credentialsId: 'EMAIL_PASS', variable: 'EMAIL_PASS'),
                        string(credentialsId: 'FRONTEND_URL', variable: 'FRONTEND_URL')
                    ]) {
                        withCredentials([sshUserPrivateKey(credentialsId: 'freejira-deploy-ssh', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                            sh """
                                ssh -i \$SSH_KEY -o StrictHostKeyChecking=no \${SSH_USER}@\${SERVER_IP} << 'ENDSSH'
set -e
cat << EOF > ${DEPLOY_PATH}/backend/.env
MONGO_URI=${MONGO_URI}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRE=${JWT_EXPIRE}
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
EMAIL_HOST=${EMAIL_HOST}
EMAIL_PORT=${EMAIL_PORT}
EMAIL_USER=${EMAIL_USER}
EMAIL_PASS=${EMAIL_PASS}
FRONTEND_URL=${FRONTEND_URL}
EOF
echo "✓ .env file created"
ENDSSH
                            """
                        }
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    echo 'Deploying to remote server...'
                    withCredentials([sshUserPrivateKey(credentialsId: 'freejira-deploy-ssh', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                        sh """
                            rsync -avz -e "ssh -i \${SSH_KEY} -o StrictHostKeyChecking=no" \
                                --exclude 'node_modules' \
                                --exclude '.git' \
                                --exclude '.next' \
                                --exclude '*.log' \
                                --exclude '.env' \
                                --exclude '.env.local' \
                                --exclude '*.md' \
                                --exclude '*.sh' \
                                --exclude '*.txt' \
                                . \${SSH_USER}@\${SERVER_IP}:${DEPLOY_PATH}
                        """
                        sh """
                            ssh -i \$SSH_KEY -o StrictHostKeyChecking=no \${SSH_USER}@\${SERVER_IP} << 'ENDSSH'
set -e
cd ${DEPLOY_PATH}/backend
echo "Installing backend dependencies..."
npm ci
cd ${DEPLOY_PATH}/frontend
echo "Installing frontend dependencies..."
npm ci
echo "Rebuilding frontend..."
npm run build
echo "Restarting services..."
cd ${DEPLOY_PATH}/backend
pm2 restart freejira-backend || pm2 start src/server.js --name freejira-backend --cwd ${DEPLOY_PATH}/backend
cd ${DEPLOY_PATH}/frontend
pm2 restart freejira-frontend || pm2 start npm --name freejira-frontend -- start
echo "✓ Services restarted"
pm2 status
ENDSSH
                        """
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline succeeded!'
            // Optional: Send notification
        }
        failure {
            echo 'Pipeline failed!'
            // Optional: Send notification
        }
        always {
            // Cleanup
            sh 'rm -f /tmp/freejira-deploy.tar.gz'
        }
    }
}


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


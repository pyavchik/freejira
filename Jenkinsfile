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
        
        stage('Deploy to Server') {
            steps {
                script {
                    echo 'Deploying to remote server...'
                    
                    // Create deployment package
                    sh '''
                        tar --exclude='node_modules' \
                            --exclude='.git' \
                            --exclude='.next' \
                            --exclude='*.log' \
                            --exclude='.env' \
                            --exclude='.env.local' \
                            --exclude='*.md' \
                            --exclude='*.sh' \
                            --exclude='*.txt' \
                            -czf /tmp/freejira-deploy.tar.gz \
                            backend/ frontend/ docker-compose.yml
                    '''
                    
                    // Copy to server using SSH credentials
                    withCredentials([sshUserPrivateKey(credentialsId: 'freejira-deploy-ssh', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                        sh """
                            scp -i \$SSH_KEY -o StrictHostKeyChecking=no /tmp/freejira-deploy.tar.gz \${SSH_USER}@${SERVER_IP}:/tmp/freejira-deploy.tar.gz
                        """
                    }
                    
                    // Extract and deploy on server
                    withCredentials([sshUserPrivateKey(credentialsId: 'freejira-deploy-ssh', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                        sh """
                            ssh -i \$SSH_KEY -o StrictHostKeyChecking=no \${SSH_USER}@${SERVER_IP} << 'ENDSSH'
set -e
cd ${DEPLOY_PATH}
mkdir -p backend frontend
tar -xzf /tmp/freejira-deploy.tar.gz -C ${DEPLOY_PATH}
rm -f /tmp/freejira-deploy.tar.gz
echo "✓ Files extracted"
ENDSSH
                        """
                    }
                }
            }
        }
        
        stage('Install Server Dependencies') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'freejira-deploy-ssh', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                    sh """
                        ssh -i \$SSH_KEY -o StrictHostKeyChecking=no \${SSH_USER}@${SERVER_IP} << 'ENDSSH'
set -e
cd ${DEPLOY_PATH}/backend
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm ci
fi
cd ${DEPLOY_PATH}/frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm ci
fi
echo "✓ Dependencies installed"
ENDSSH
                    """
                }
            }
        }
        
        stage('Restart Services') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'freejira-deploy-ssh', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                    sh """
                        ssh -i \$SSH_KEY -o StrictHostKeyChecking=no \${SSH_USER}@${SERVER_IP} << 'ENDSSH'
set -e
cd ${DEPLOY_PATH}/frontend
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


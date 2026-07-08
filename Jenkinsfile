// Requires a Jenkins agent with Docker and Node.js 22 available on PATH.
//
// Jenkins credentials expected (Manage Jenkins → Credentials):
//   dockerhub-credentials        Username/password — Docker Hub
//   render-backend-deploy-hook   Secret text — Render deploy hook URL (backend service)
//   render-frontend-deploy-hook  Secret text — Render deploy hook URL (frontend service)
//
// See README.md for one-time Docker Hub / Render setup.

pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    DOCKERHUB_NAMESPACE = 'chayma216'
    BACKEND_IMAGE = "${DOCKERHUB_NAMESPACE}/collabrix-backend"
    FRONTEND_IMAGE = "${DOCKERHUB_NAMESPACE}/collabrix-frontend"
    IMAGE_TAG = "${env.GIT_COMMIT.take(7)}"
    TEST_DB_CONTAINER = "collabrix-test-postgres-${env.BUILD_NUMBER}"
    DATABASE_URL = 'postgresql://collabrix:collabrix@localhost:5433/collabrix?schema=public'
    JWT_SECRET = 'jenkins-ci-secret'
    JWT_EXPIRES_IN = '7d'
    PORT = '3000'
    CORS_ORIGIN = 'http://localhost:5173'
  }

  stages {
    stage('Install dependencies') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Lint') {
      parallel {
        stage('Backend') {
          steps { sh 'npm run lint --workspace backend' }
        }
        stage('Frontend') {
          steps { sh 'npm run lint --workspace frontend' }
        }
      }
    }

    stage('Test backend') {
      steps {
        sh """
          docker run -d --name ${TEST_DB_CONTAINER} \
            -e POSTGRES_USER=collabrix -e POSTGRES_PASSWORD=collabrix -e POSTGRES_DB=collabrix \
            -p 5433:5432 postgres:17-alpine
          until docker exec ${TEST_DB_CONTAINER} pg_isready -U collabrix; do sleep 2; done
        """
        sh 'npm run prisma:generate --workspace backend'
        dir('backend') {
          sh 'npx prisma migrate deploy'
        }
        sh 'npm run build --workspace backend'
        sh 'npm test --workspace backend -- --passWithNoTests'
        sh 'npm run test:e2e --workspace backend'
      }
      post {
        always {
          sh "docker rm -f ${TEST_DB_CONTAINER} || true"
        }
      }
    }

    stage('Build frontend') {
      steps {
        sh 'npm run build --workspace frontend'
      }
    }

    stage('Build Docker images') {
      steps {
        sh "docker build -f backend/Dockerfile -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ."
        sh "docker build -f frontend/Dockerfile --build-arg VITE_API_URL=/api -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ."
      }
    }

    stage('Push to Docker Hub') {
      when { branch 'main' }
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-credentials',
          usernameVariable: 'DOCKERHUB_USER',
          passwordVariable: 'DOCKERHUB_PASS'
        )]) {
          sh 'echo "$DOCKERHUB_PASS" | docker login -u "$DOCKERHUB_USER" --password-stdin'
        }
        sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
        sh "docker push ${BACKEND_IMAGE}:latest"
        sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
        sh "docker push ${FRONTEND_IMAGE}:latest"
      }
    }

    stage('Deploy to Render') {
      when { branch 'main' }
      steps {
        withCredentials([
          string(credentialsId: 'render-backend-deploy-hook', variable: 'BACKEND_HOOK'),
          string(credentialsId: 'render-frontend-deploy-hook', variable: 'FRONTEND_HOOK'),
        ]) {
          sh 'curl -fsS -X POST "$BACKEND_HOOK"'
          sh 'curl -fsS -X POST "$FRONTEND_HOOK"'
        }
      }
    }
  }

  post {
    always {
      sh 'docker logout || true'
    }
  }
}

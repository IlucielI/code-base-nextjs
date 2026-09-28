.PHONY: help dev build test test-cov lint docker-build docker-build-base docker-up docker-down

# Default target
help:
	@echo "Available commands:"
	@echo "  make dev                   Run Next.js development server (npm run dev)"
	@echo "  make build                 Build standalone production bundle (npm run build)"
	@echo "  make test                  Run unit & component tests (npm test)"
	@echo "  make test-cov              Run tests with coverage report (npm run test:coverage)"
	@echo "  make lint                  Run ESLint check (npm run lint)"
	@echo "  make docker-build-base     Build the npm dependencies base Docker image"
	@echo "  make docker-build          Build application Docker image via deployment/build.sh"
	@echo "  make docker-up             Start containerized application via Docker Compose"
	@echo "  make docker-down           Stop Docker Compose services"

dev:
	npm run dev

build:
	npm run build

test:
	npm test

test-cov:
	npm run test:coverage

lint:
	npm run lint

docker-build-base:
	./deployment/build-base.sh

docker-build:
	./deployment/build.sh

docker-up:
	docker compose -f deployment/docker-compose.yaml up -d

docker-down:
	docker compose -f deployment/docker-compose.yaml down

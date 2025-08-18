# Makefile for VibeCoding Demo Project

.PHONY: help dev build test e2e clean install deploy

# Default target
help:
	@echo "Available commands:"
	@echo "  make dev        - Start frontend development server"
	@echo "  make build      - Build all components (frontend, backend, shared)"
	@echo "  make test       - Run all tests (unit + integration)"
	@echo "  make e2e        - Run E2E tests (default environment)"
	@echo "  make e2e-local  - Run E2E tests against local server"
	@echo "  make e2e-pages  - Run E2E tests against GitHub Pages"
	@echo "  make e2e-headed - Run E2E tests with browser UI"
	@echo "  make e2e-debug  - Run E2E tests in debug mode"
	@echo "  make install    - Install all dependencies"
	@echo "  make clean      - Clean build artifacts"
	@echo "  make deploy     - Deploy to AWS"

# Development
dev:
	npm run frontend:dev

# Build
build:
	npm run frontend:build
	npm run backend:build
	npm run shared:build

# Testing
test:
	npm run frontend:test
	npm run backend:test
	npm run shared:test

# E2E Testing
e2e:
	npm run e2e

e2e-local:
	npm run e2e:local

e2e-pages:
	npm run e2e:pages

e2e-headed:
	npm run e2e:headed

e2e-debug:
	npm run e2e:debug

e2e-noreport:
	npm run e2e:noreport

# Installation
install:
	npm ci

# Clean
clean:
	rm -rf frontend/dist frontend/node_modules
	rm -rf backend/dist backend/node_modules
	rm -rf shared/dist shared/node_modules
	rm -rf node_modules

# Deployment
deploy:
	npm run cdk:deploy

# Lint
lint:
	npm run frontend:lint
	npm run backend:lint
	npm run shared:lint
#!/bin/bash

# 파이프라인에서 API 엔드포인트를 취득하는 스크립트

set -e

STACK_NAME="TodoAppApiStack"
AUTH_STACK_NAME="TodoAppAuthStack"
REGION="${AWS_REGION:-ap-northeast-2}"

echo "🔍 Retrieving API endpoints from CloudFormation stacks..."

# CloudFormation에서 API 엔드포인트 추출
API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text)

# Cognito Identity Pool ID 추출
IDENTITY_POOL_ID=$(aws cloudformation describe-stacks \
  --stack-name $AUTH_STACK_NAME \
  --region $REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`IdentityPoolId`].OutputValue' \
  --output text)

if [ -z "$API_ENDPOINT" ] || [ -z "$IDENTITY_POOL_ID" ]; then
  echo "❌ Failed to retrieve endpoints from CloudFormation"
  exit 1
fi

echo "✅ Successfully retrieved endpoints:"
echo "   API Endpoint: $API_ENDPOINT"
echo "   Identity Pool ID: $IDENTITY_POOL_ID"

# GitHub Actions 환경에서 출력 변수 설정
if [ "$GITHUB_ACTIONS" = "true" ]; then
  echo "api-endpoint=$API_ENDPOINT" >> $GITHUB_OUTPUT
  echo "identity-pool-id=$IDENTITY_POOL_ID" >> $GITHUB_OUTPUT
fi

# 환경 변수로 내보내기
export VITE_API_BASE_URL="$API_ENDPOINT"
export VITE_COGNITO_IDENTITY_POOL_ID="$IDENTITY_POOL_ID"
export VITE_API_REGION="$REGION"
export VITE_COGNITO_REGION="$REGION"

echo "🔧 Environment variables set for frontend build"
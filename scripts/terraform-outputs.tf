# Terraform에서 API 엔드포인트 출력 예시

# API Gateway 출력
output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = aws_api_gateway_deployment.main.invoke_url
}

# Cognito Identity Pool 출력
output "cognito_identity_pool_id" {
  description = "Cognito Identity Pool ID"
  value       = aws_cognito_identity_pool.main.id
}

# 프론트엔드 환경 변수 파일 생성
resource "local_file" "frontend_env" {
  content = templatefile("${path.module}/env.tpl", {
    api_endpoint = aws_api_gateway_deployment.main.invoke_url
    identity_pool_id = aws_cognito_identity_pool.main.id
    aws_region = var.aws_region
  })
  filename = "${path.module}/../frontend/.env"
}

# 환경 변수 템플릿 파일 (env.tpl)
# # API 설정
# VITE_API_BASE_URL=${api_endpoint}
# VITE_API_REGION=${aws_region}
# 
# # Cognito 설정 (unauthenticated 사용자용)
# VITE_COGNITO_IDENTITY_POOL_ID=${identity_pool_id}
# VITE_COGNITO_REGION=${aws_region}
# 
# # 프로덕션 모드 설정
# VITE_USE_LOCAL_STORAGE=false
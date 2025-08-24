# Scripts Makefile
# 재사용 가능한 유틸리티 스크립트들을 편리하게 실행하기 위한 Makefile

.PHONY: help clean-data get-pages-url get-api-endpoint add-issues set-schedule project-help

# 기본 도움말
help:
	@echo "📋 Scripts - 유틸리티 스크립트 모음"
	@echo "========================================"
	@echo ""
	@echo "🔧 개발 도구"
	@echo "  clean-data       - 백엔드 테스트 데이터 정리"
	@echo "  get-pages-url    - GitHub Pages 배포 URL 확인"
	@echo "  get-api-endpoint - API 엔드포인트 URL 확인"
	@echo ""
	@echo "📊 GitHub Projects 관리"
	@echo "  add-issues       - 이슈를 프로젝트에 추가"
	@echo "  set-schedule     - 프로젝트 일정 설정"
	@echo "  project-help     - GitHub Projects 도구 도움말"
	@echo ""
	@echo "💡 사용법: make <command>"
	@echo "   예시: make get-pages-url"

# 개발 도구들
clean-data:
	@echo "🧹 백엔드 테스트 데이터 정리 중..."
	@./clean-backend-data.sh

get-pages-url:
	@echo "🌐 GitHub Pages URL 확인 중..."
	@./get-pages-url.sh

get-api-endpoint:
	@echo "🔗 API 엔드포인트 확인 중..."
	@./get-api-endpoint.sh

# GitHub Projects 관리 도구들
add-issues:
	@echo "➕ GitHub Projects에 이슈 추가 도구"
	@echo "사용법: ./add-issues-to-project.sh <command> [arguments]"
	@echo ""
	@echo "Commands:"
	@echo "  label <label>       - 특정 라벨을 가진 이슈들 추가"
	@echo "  issues <numbers>    - 특정 이슈 번호들 추가"
	@echo "  isms               - 모든 ISMS-P 관련 이슈들 추가"
	@echo "  list               - 프로젝트 내 이슈 목록 조회"
	@echo "  status             - 프로젝트 현황 및 통계"
	@echo ""
	@echo "예시:"
	@echo "  ./add-issues-to-project.sh label phase0"
	@echo "  ./add-issues-to-project.sh issues 33 50 51"

set-schedule:
	@echo "📅 프로젝트 일정 설정 도구"
	@echo "사용법: ./set-project-schedule.sh <command> [arguments]"
	@echo ""
	@echo "Commands:"
	@echo "  all                 - 전체 ISMS-P 로드맵 일정 설정"
	@echo "  phase <number>      - 특정 Phase만 일정 설정"
	@echo "  fields              - 프로젝트 날짜 필드 정보 조회"
	@echo ""
	@echo "예시:"
	@echo "  ./set-project-schedule.sh all"
	@echo "  ./set-project-schedule.sh phase 0"

project-help:
	@echo "📊 GitHub Projects 관리 도구"
	@echo "사용법: ./project-helper.sh <command> [arguments]"
	@echo ""
	@echo "🎯 주요 기능:"
	@echo "  - GitHub Projects API를 활용한 이슈 관리"
	@echo "  - K-ISMS-P 로드맵 체계적 관리"
	@echo "  - 프로젝트 일정 및 우선순위 설정"
	@echo ""
	@echo "📖 상세 사용법은 각 스크립트의 help 옵션 참고:"
	@echo "  ./add-issues-to-project.sh help"
	@echo "  ./set-project-schedule.sh help"

# 전체 정리
clean-all: clean-data
	@echo "🧹 전체 데이터 정리 완료"

# 프로젝트 설정 전체
setup-project: add-issues set-schedule
	@echo "🚀 GitHub Projects 설정 완료"
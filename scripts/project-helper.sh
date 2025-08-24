#!/bin/bash

# GitHub Projects API 헬퍼 스크립트
# 33번 이슈 (T005: 상세 로드맵 수립)을 위한 프로젝트 관리 도구

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로깅 함수
function log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}" >&2
}

function log_success() {
    echo -e "${GREEN}✅ $1${NC}" >&2
}

function log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" >&2
}

function log_error() {
    echo -e "${RED}❌ $1${NC}" >&2
}

# 프로젝트 정보
PROJECT_ID="PVT_kwDODMg8sM4BBSPP"
ORG="Hands-On-Vibe-Coding"

# GitHub CLI 및 인증 확인
function check_requirements() {
    if ! command -v gh &> /dev/null; then
        log_error "GitHub CLI가 설치되지 않았습니다."
        log_info "설치 방법: https://cli.github.com"
        exit 1
    fi

    if ! gh auth status &> /dev/null; then
        log_error "GitHub CLI 인증이 필요합니다."
        log_info "실행: gh auth login"
        exit 1
    fi
}

# 프로젝트 필드 정보 가져오기
function get_project_fields() {
    log_info "프로젝트 필드 정보 가져오는 중..."
    gh api graphql -f query='
        query($org: String!, $project: Int!) {
            organization(login: $org) {
                projectV2(number: $project) {
                    id
                    title
                    fields(first: 20) {
                        nodes {
                            ... on ProjectV2Field {
                                id
                                name
                                dataType
                            }
                            ... on ProjectV2SingleSelectField {
                                id
                                name
                                dataType
                                options {
                                    id
                                    name
                                }
                            }
                        }
                    }
                }
            }
        }' -f org="$ORG" -F project=2
}

# 프로젝트 아이템 생성
function create_project_item() {
    local title="$1"
    local issue_number="$2"
    
    log_info "프로젝트 아이템 생성 중: $title"
    
    # 먼저 이슈를 프로젝트에 추가
    gh api graphql -f query='
        mutation($project: ID!, $issue: ID!) {
            addProjectV2ItemById(input: {projectId: $project, contentId: $issue}) {
                item {
                    id
                }
            }
        }' -f project="$PROJECT_ID" -f issue="$issue_number"
}

# 프로젝트 아이템 상태 업데이트
function update_item_status() {
    local item_id="$1"
    local status="$2"
    local field_id="$3"
    local option_id="$4"
    
    log_info "아이템 상태 업데이트 중..."
    
    gh api graphql -f query='
        mutation($project: ID!, $item: ID!, $field: ID!, $value: ProjectV2FieldValue!) {
            updateProjectV2ItemFieldValue(input: {
                projectId: $project
                itemId: $item
                fieldId: $field
                value: $value
            }) {
                projectV2Item {
                    id
                }
            }
        }' -f project="$PROJECT_ID" -f item="$item_id" -f field="$field_id" -f value="{\"singleSelectOptionId\":\"$option_id\"}"
}

# 프로젝트 아이템 목록 조회
function list_project_items() {
    log_info "프로젝트 아이템 목록 조회 중..."
    
    gh api graphql -f query='
        query($org: String!, $project: Int!) {
            organization(login: $org) {
                projectV2(number: $project) {
                    id
                    title
                    items(first: 50) {
                        nodes {
                            id
                            content {
                                ... on Issue {
                                    id
                                    number
                                    title
                                    state
                                    labels(first: 10) {
                                        nodes {
                                            name
                                        }
                                    }
                                }
                            }
                            fieldValues(first: 8) {
                                nodes {
                                    ... on ProjectV2ItemFieldTextValue {
                                        text
                                        field {
                                            ... on ProjectV2Field {
                                                name
                                            }
                                        }
                                    }
                                    ... on ProjectV2ItemFieldSingleSelectValue {
                                        name
                                        field {
                                            ... on ProjectV2SingleSelectField {
                                                name
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }' -f org="$ORG" -F project=2
}

# Phase 0 세부 작업 아이템 생성
function create_phase0_roadmap() {
    log_info "Phase 0 상세 로드맵 아이템 생성 시작..."
    
    # 33번 이슈를 먼저 프로젝트에 추가
    local issue_33_id=$(gh api repos/"$ORG"/handson-vibecoding-demo/issues/33 --jq '.node_id')
    
    # 메인 이슈를 프로젝트에 추가
    create_project_item "🗺️ [Phase 0] T005: 상세 로드맵 수립" "$issue_33_id"
    
    # 세부 작업들을 위한 이슈 생성 및 프로젝트 추가
    local subtasks=(
        "📅 Phase별 상세 일정 수립 (Week 단위 스케줄)"
        "🔄 태스크 간 의존성 분석 및 Critical Path 식별"
        "👥 리소스 배치 계획 (내부 인력 + 외부 컨설턴트)"
        "📊 역할 및 책임 매트릭스 (RACI Matrix) 작성"
        "💰 예산 배분 및 승인 절차 정리"
        "📈 단계별 예산 집행 계획 수립"
        "⚠️ 리스크 식별 및 영향도 분석"
        "🛡️ 리스크별 대응 방안 및 Contingency Plan 수립"
        "📋 상세 프로젝트 계획서 (32주 일정표) 작성"
        "📑 경영진 승인용 요약 보고서 작성"
    )
    
    for subtask in "${subtasks[@]}"; do
        log_info "서브태스크 이슈 생성: $subtask"
        
        # GitHub 이슈 생성
        local issue_body="## 📊 개요
**부모 태스크**: #33 (T005: 상세 로드맵 수립)  
**Phase**: Discovery (Week 3-4)  
**우선순위**: P0

## 🎯 작업 내용
$subtask

## 📋 상세 작업
- [ ] 작업 계획 수립
- [ ] 실행 및 검토
- [ ] 결과물 작성 및 검증

## 📊 산출물
- 해당 작업 결과 문서 또는 계획서

## 🔗 연관 작업  
- #33 (부모 태스크)

## ✅ 완료 기준
- [ ] 작업 완료 및 검증
- [ ] 문서화 완료
- [ ] 관련 이해관계자 검토 완료

---
**관련 문서**: docs/Security/K-ISMS-P-Tasks.md (T005)  
**K-ISMS-P 인증기준**: 관리체계 > 정보보호 계획

🤖 Generated with [Claude Code](https://claude.ai/code)"

        # 이슈 생성 및 프로젝트에 추가
        local new_issue=$(gh issue create \
            --title "$subtask" \
            --body "$issue_body" \
            --label "documentation,enhancement,phase0,subtask" \
            --milestone 1 \
            --assignee "@me")
        
        local issue_number=$(echo "$new_issue" | grep -o '#[0-9]*' | sed 's/#//')
        local issue_node_id=$(gh api repos/"$ORG"/handson-vibecoding-demo/issues/"$issue_number" --jq '.node_id')
        
        # 프로젝트에 추가
        create_project_item "$subtask" "$issue_node_id"
        
        log_success "이슈 #$issue_number 생성 및 프로젝트 추가 완료"
        
        # API 제한을 위한 대기
        sleep 1
    done
    
    log_success "Phase 0 상세 로드맵 아이템 생성 완료!"
}

# 도움말 출력
function show_help() {
    echo "GitHub Projects API 헬퍼 스크립트"
    echo ""
    echo "사용법: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  fields           - 프로젝트 필드 정보 조회"
    echo "  items            - 프로젝트 아이템 목록 조회"
    echo "  create-roadmap   - Phase 0 상세 로드맵 아이템 생성"
    echo "  help             - 도움말 표시"
    echo ""
    echo "환경 변수:"
    echo "  PROJECT_ID       - GitHub 프로젝트 ID (기본값: $PROJECT_ID)"
    echo "  ORG              - GitHub 조직명 (기본값: $ORG)"
    echo ""
}

# 메인 함수
function main() {
    check_requirements
    
    case "${1:-help}" in
        "fields")
            get_project_fields
            ;;
        "items")
            list_project_items
            ;;
        "create-roadmap")
            create_phase0_roadmap
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# 스크립트 실행
main "$@"
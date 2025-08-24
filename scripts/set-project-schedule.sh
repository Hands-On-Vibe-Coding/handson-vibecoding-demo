#!/bin/bash

# GitHub Projects에 일정(Start date, End date) 설정 스크립트
# K-ISMS-P 32주 로드맵 기준으로 각 이슈에 날짜 설정

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

# 프로젝트 시작일 (오늘부터 시작)
PROJECT_START_DATE="2024-08-26"  # 월요일부터 시작

# 날짜 계산 함수 (macOS 호환)
function add_days() {
    local start_date="$1"
    local days="$2"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        date -j -v+"${days}d" -f "%Y-%m-%d" "$start_date" "+%Y-%m-%d"
    else
        # Linux
        date -d "$start_date + $days days" "+%Y-%m-%d"
    fi
}

function add_weeks() {
    local start_date="$1"
    local weeks="$2"
    local days=$((weeks * 7))
    add_days "$start_date" "$days"
}

# 프로젝트 필드 ID 가져오기
function get_project_fields() {
    log_info "프로젝트 필드 정보 조회 중..."
    
    gh api graphql -f query='
        query($org: String!, $project: Int!) {
            organization(login: $org) {
                projectV2(number: $project) {
                    id
                    fields(first: 20) {
                        nodes {
                            ... on ProjectV2Field {
                                id
                                name
                                dataType
                            }
                        }
                    }
                }
            }
        }' -f org="$ORG" -F project=2 --jq '.data.organization.projectV2.fields.nodes[] | select(.name == "Start date" or .name == "End date") | {name, id}'
}

# 프로젝트 아이템 정보 가져오기
function get_project_items() {
    gh api graphql -f query='
        query($org: String!, $project: Int!) {
            organization(login: $org) {
                projectV2(number: $project) {
                    items(first: 100) {
                        nodes {
                            id
                            content {
                                ... on Issue {
                                    number
                                    title
                                }
                            }
                        }
                    }
                }
            }
        }' -f org="$ORG" -F project=2
}

# 특정 프로젝트 아이템에 날짜 설정
function set_item_dates() {
    local item_id="$1"
    local start_date="$2"
    local end_date="$3"
    local start_field_id="$4"
    local end_field_id="$5"
    local issue_title="$6"
    
    log_info "일정 설정 중: $issue_title"
    log_info "  시작: $start_date, 종료: $end_date"
    
    # Start date 설정
    if [[ -n "$start_date" && -n "$start_field_id" ]]; then
        gh api graphql -f query='
            mutation($project: ID!, $item: ID!, $field: ID!, $value: Date!) {
                updateProjectV2ItemFieldValue(input: {
                    projectId: $project
                    itemId: $item
                    fieldId: $field
                    value: { date: $value }
                }) {
                    projectV2Item { id }
                }
            }' -f project="$PROJECT_ID" -f item="$item_id" -f field="$start_field_id" -f value="$start_date" >/dev/null 2>&1
    fi
    
    # End date 설정
    if [[ -n "$end_date" && -n "$end_field_id" ]]; then
        gh api graphql -f query='
            mutation($project: ID!, $item: ID!, $field: ID!, $value: Date!) {
                updateProjectV2ItemFieldValue(input: {
                    projectId: $project
                    itemId: $item
                    fieldId: $field
                    value: { date: $value }
                }) {
                    projectV2Item { id }
                }
            }' -f project="$PROJECT_ID" -f item="$item_id" -f field="$end_field_id" -f value="$end_date" >/dev/null 2>&1
    fi
    
    log_success "일정 설정 완료"
}

# ISMS-P 로드맵 일정 설정
function set_isms_schedule() {
    log_info "=== ISMS-P 32주 로드맵 일정 설정 시작 ==="
    
    # 필드 ID 가져오기
    local fields=$(get_project_fields)
    local start_field_id=$(echo "$fields" | jq -r 'select(.name == "Start date") | .id')
    local end_field_id=$(echo "$fields" | jq -r 'select(.name == "End date") | .id')
    
    if [[ -z "$start_field_id" || -z "$end_field_id" ]]; then
        log_error "Start date 또는 End date 필드를 찾을 수 없습니다."
        log_info "프로젝트에 날짜 필드가 있는지 확인해주세요."
        return 1
    fi
    
    log_info "Start date 필드 ID: $start_field_id"
    log_info "End date 필드 ID: $end_field_id"
    
    # 프로젝트 아이템들 가져오기
    local items=$(get_project_items)
    
    # Phase 0: Discovery (Week 1-4) - 2024-08-26 ~ 2024-09-20
    local phase0_start="$PROJECT_START_DATE"
    local phase0_end=$(add_weeks "$PROJECT_START_DATE" 4)
    
    # Phase 1: Foundation (Week 5-12) - 2024-09-23 ~ 2024-11-15  
    local phase1_start=$(add_weeks "$PROJECT_START_DATE" 4)
    local phase1_end=$(add_weeks "$PROJECT_START_DATE" 12)
    
    # Phase 2: Protection (Week 13-20) - 2024-11-18 ~ 2025-01-10
    local phase2_start=$(add_weeks "$PROJECT_START_DATE" 12)
    local phase2_end=$(add_weeks "$PROJECT_START_DATE" 20)
    
    # Phase 3: Compliance (Week 21-24) - 2025-01-13 ~ 2025-02-07
    local phase3_start=$(add_weeks "$PROJECT_START_DATE" 20)
    local phase3_end=$(add_weeks "$PROJECT_START_DATE" 24)
    
    # Phase 4: Certification (Week 25-32) - 2025-02-10 ~ 2025-04-04
    local phase4_start=$(add_weeks "$PROJECT_START_DATE" 24)
    local phase4_end=$(add_weeks "$PROJECT_START_DATE" 32)
    
    log_info "Phase 일정 계획:"
    log_info "  Phase 0: $phase0_start ~ $phase0_end"
    log_info "  Phase 1: $phase1_start ~ $phase1_end"
    log_info "  Phase 2: $phase2_start ~ $phase2_end"
    log_info "  Phase 3: $phase3_start ~ $phase3_end"
    log_info "  Phase 4: $phase4_start ~ $phase4_end"
    
    # 각 이슈별 일정 설정
    while IFS= read -r item; do
        local item_id=$(echo "$item" | jq -r '.id')
        local issue_number=$(echo "$item" | jq -r '.content.number')
        local issue_title=$(echo "$item" | jq -r '.content.title')
        
        if [[ "$issue_number" == "null" || -z "$issue_number" ]]; then
            continue
        fi
        
        local start_date=""
        local end_date=""
        
        # 이슈 번호와 제목을 기반으로 일정 결정
        case "$issue_title" in
            *"Phase 0"*|*"T004"*|*"T005"*)
                start_date="$phase0_start"
                end_date="$phase0_end"
                ;;
            *"T005-01"*)  # Phase별 상세 일정 수립 (3일)
                start_date="$phase0_start"
                end_date=$(add_days "$phase0_start" 3)
                ;;
            *"Phase 1"*|*"T006"*|*"T007"*|*"T008"*|*"T009"*|*"T010"*|*"T011"*|*"T012"*|*"T013"*)
                start_date="$phase1_start"
                end_date="$phase1_end"
                ;;
            *"T012-CR-001"*|*"T012-CR-002"*|*"T012-CR-003"*|*"T012-CR-004"*)  # Priority 0 (Day 1-3)
                start_date="$phase1_start"
                end_date=$(add_days "$phase1_start" 3)
                ;;
            *"T012-CR-005"*|*"T012-CR-006"*|*"T012-CR-007"*|*"T012-CR-008"*)  # Priority 1 (Day 4-7)
                start_date=$(add_days "$phase1_start" 3)
                end_date=$(add_days "$phase1_start" 7)
                ;;
            *"T012-CR-009"*|*"T012-CR-010"*|*"T012-CR-011"*|*"T012-CR-012"*)  # Priority 2 (Day 8-10)
                start_date=$(add_days "$phase1_start" 7)
                end_date=$(add_days "$phase1_start" 10)
                ;;
            *"Phase 2"*|*"T014"*|*"T016"*|*"T018"*)
                start_date="$phase2_start"
                end_date="$phase2_end"
                ;;
            *"Phase 3"*|*"T022"*|*"T024"*)
                start_date="$phase3_start"
                end_date="$phase3_end"
                ;;
            *"Phase 4"*|*"T027"*|*"T033"*|*"T034"*)
                start_date="$phase4_start"
                end_date="$phase4_end"
                ;;
            *)
                log_warning "일정을 설정할 수 없는 이슈: #$issue_number $issue_title"
                continue
                ;;
        esac
        
        if [[ -n "$start_date" && -n "$end_date" ]]; then
            set_item_dates "$item_id" "$start_date" "$end_date" "$start_field_id" "$end_field_id" "$issue_title"
        fi
        
        # API 제한 대응
        sleep 1
        
    done < <(echo "$items" | jq -c '.data.organization.projectV2.items.nodes[]')
    
    log_success "=== ISMS-P 로드맵 일정 설정 완료 ==="
    log_info "GitHub Projects 로드맵 뷰에서 확인하세요:"
    log_info "https://github.com/orgs/Hands-On-Vibe-Coding/projects/2/views/1"
}

# 특정 Phase만 일정 설정
function set_phase_schedule() {
    local phase="$1"
    log_info "Phase $phase 일정 설정 중..."
    
    case "$phase" in
        "0")
            # Phase 0만 설정하는 로직
            ;;
        "1")
            # Phase 1만 설정하는 로직  
            ;;
        *)
            log_error "지원하지 않는 Phase: $phase"
            ;;
    esac
}

# 도움말
function show_help() {
    echo "GitHub Projects 일정 설정 도구"
    echo ""
    echo "사용법: $0 <command> [arguments]"
    echo ""
    echo "Commands:"
    echo "  all                 - 전체 ISMS-P 로드맵 일정 설정"
    echo "  phase <number>      - 특정 Phase만 일정 설정"
    echo "  fields              - 프로젝트 날짜 필드 정보 조회"
    echo "  help                - 도움말 표시"
    echo ""
    echo "예시:"
    echo "  $0 all"
    echo "  $0 phase 0"
    echo "  $0 fields"
    echo ""
    echo "일정 기준:"
    echo "  프로젝트 시작: $PROJECT_START_DATE"
    echo "  전체 기간: 32주 (약 8개월)"
    echo ""
}

# GitHub CLI 및 인증 확인
function check_requirements() {
    if ! command -v gh &> /dev/null; then
        log_error "GitHub CLI가 설치되지 않았습니다."
        exit 1
    fi

    if ! gh auth status &> /dev/null; then
        log_error "GitHub CLI 인증이 필요합니다."
        exit 1
    fi
}

# 메인 함수
function main() {
    check_requirements
    
    case "${1:-help}" in
        "all")
            set_isms_schedule
            ;;
        "phase")
            if [[ -z "$2" ]]; then
                log_error "Phase 번호를 지정해주세요."
                show_help
                exit 1
            fi
            set_phase_schedule "$2"
            ;;
        "fields")
            get_project_fields
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# 스크립트 실행
main "$@"
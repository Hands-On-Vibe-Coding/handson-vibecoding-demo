#!/bin/bash

# GitHub Projects에 이슈들을 추가하는 스크립트
# GitHub API v4 (GraphQL)를 사용하여 프로젝트에 이슈 추가

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
REPO="handson-vibecoding-demo"

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

# 이슈를 프로젝트에 추가
function add_issue_to_project() {
    local issue_number="$1"
    local issue_title="$2"
    
    log_info "이슈 #$issue_number 프로젝트에 추가 중: $issue_title"
    
    # 이슈의 node_id 가져오기
    local issue_node_id=$(gh api repos/"$ORG"/"$REPO"/issues/"$issue_number" --jq '.node_id')
    
    if [[ -z "$issue_node_id" ]]; then
        log_error "이슈 #$issue_number의 node_id를 가져올 수 없습니다."
        return 1
    fi
    
    # GraphQL 뮤테이션으로 프로젝트에 추가
    local result=$(gh api graphql -f query='
        mutation($project: ID!, $issue: ID!) {
            addProjectV2ItemById(input: {projectId: $project, contentId: $issue}) {
                item {
                    id
                    content {
                        ... on Issue {
                            number
                            title
                        }
                    }
                }
            }
        }' -f project="$PROJECT_ID" -f issue="$issue_node_id" 2>/dev/null)
    
    if echo "$result" | jq -e '.data.addProjectV2ItemById.item.id' > /dev/null; then
        log_success "이슈 #$issue_number 프로젝트 추가 완료"
        return 0
    else
        log_warning "이슈 #$issue_number 이미 프로젝트에 있거나 추가 실패"
        return 1
    fi
}

# 특정 라벨을 가진 모든 이슈를 프로젝트에 추가
function add_issues_by_label() {
    local label="$1"
    log_info "라벨 '$label'을 가진 이슈들을 프로젝트에 추가 중..."
    
    # 해당 라벨을 가진 오픈 이슈들 가져오기
    local issues=$(gh issue list --label "$label" --state open --json number,title --limit 50)
    
    if [[ "$issues" == "[]" ]]; then
        log_warning "라벨 '$label'을 가진 오픈 이슈가 없습니다."
        return 0
    fi
    
    local added_count=0
    local failed_count=0
    
    # 각 이슈를 프로젝트에 추가
    while IFS= read -r issue; do
        local issue_number=$(echo "$issue" | jq -r '.number')
        local issue_title=$(echo "$issue" | jq -r '.title')
        
        if add_issue_to_project "$issue_number" "$issue_title"; then
            ((added_count++))
        else
            ((failed_count++))
        fi
        
        # API 제한 대응
        sleep 0.5
        
    done < <(echo "$issues" | jq -c '.[]')
    
    log_success "라벨 '$label': $added_count개 추가 완료, $failed_count개 실패/중복"
}

# 특정 이슈 번호들을 프로젝트에 추가
function add_specific_issues() {
    local issue_numbers=("$@")
    log_info "${#issue_numbers[@]}개 이슈를 프로젝트에 추가 중..."
    
    local added_count=0
    local failed_count=0
    
    for issue_number in "${issue_numbers[@]}"; do
        # 이슈 제목 가져오기
        local issue_title=$(gh issue view "$issue_number" --json title --jq '.title' 2>/dev/null)
        
        if [[ -z "$issue_title" ]]; then
            log_error "이슈 #$issue_number를 찾을 수 없습니다."
            ((failed_count++))
            continue
        fi
        
        if add_issue_to_project "$issue_number" "$issue_title"; then
            ((added_count++))
        else
            ((failed_count++))
        fi
        
        # API 제한 대응
        sleep 0.5
    done
    
    log_success "$added_count개 이슈 추가 완료, $failed_count개 실패/중복"
}

# 현재 프로젝트에 있는 이슈들 확인
function list_project_issues() {
    log_info "현재 프로젝트에 있는 이슈들 조회 중..."
    
    local result=$(gh api graphql -f query='
        query($org: String!, $project: Int!) {
            organization(login: $org) {
                projectV2(number: $project) {
                    id
                    title
                    items(first: 100) {
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
                        }
                    }
                }
            }
        }' -f org="$ORG" -F project=2)
    
    echo "$result" | jq -r '.data.organization.projectV2.items.nodes[] | select(.content.number != null) | "#\(.content.number): \(.content.title)"' | sort -n
}

# ISMS-P 관련 이슈들 일괄 추가
function add_isms_issues() {
    log_info "=== ISMS-P 관련 이슈들을 프로젝트에 추가 ==="
    
    # Phase별로 라벨을 기준으로 추가
    local phases=("phase0" "phase1" "phase2" "phase3" "phase4")
    
    for phase in "${phases[@]}"; do
        log_info "--- $phase 이슈들 추가 ---"
        add_issues_by_label "$phase"
    done
    
    # 추가적으로 보안 관련 이슈들
    log_info "--- security 라벨 이슈들 추가 ---"
    add_issues_by_label "security"
    
    # roadmap 관련 이슈들
    log_info "--- roadmap 라벨 이슈들 추가 ---"  
    add_issues_by_label "roadmap"
    
    log_success "=== ISMS-P 이슈 추가 완료 ==="
}

# T012 Critical Risk 대응 이슈들 추가
function add_t012_issues() {
    log_info "=== T012 Critical Risk 대응 이슈들 추가 ==="
    
    # T012-CR-001 ~ T012-CR-012 이슈들 (이슈 번호 50-61)
    local cr_issues=(50 51 52 53 54 55 56 57 58 59 60 61)
    add_specific_issues "${cr_issues[@]}"
    
    log_success "=== T012 Critical Risk 이슈 추가 완료 ==="
}

# 프로젝트 상태 및 통계
function show_project_status() {
    log_info "=== 프로젝트 현황 ==="
    
    local result=$(gh api graphql -f query='
        query($org: String!, $project: Int!) {
            organization(login: $org) {
                projectV2(number: $project) {
                    title
                    items(first: 100) {
                        totalCount
                        nodes {
                            content {
                                ... on Issue {
                                    state
                                    labels(first: 10) {
                                        nodes {
                                            name
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }' -f org="$ORG" -F project=2)
    
    local total_count=$(echo "$result" | jq -r '.data.organization.projectV2.items.totalCount')
    local open_count=$(echo "$result" | jq -r '[.data.organization.projectV2.items.nodes[] | select(.content.state == "OPEN")] | length')
    local closed_count=$(echo "$result" | jq -r '[.data.organization.projectV2.items.nodes[] | select(.content.state == "CLOSED")] | length')
    
    echo "프로젝트: 핸즈온 바이브 코딩 데모 어플리케이션의 ISMS 취득"
    echo "총 아이템: $total_count개"
    echo "열린 이슈: $open_count개"  
    echo "닫힌 이슈: $closed_count개"
    echo ""
    echo "프로젝트 URL: https://github.com/orgs/Hands-On-Vibe-Coding/projects/2/views/1"
}

# 도움말
function show_help() {
    echo "GitHub Projects에 이슈 추가 도구"
    echo ""
    echo "사용법: $0 <command> [arguments]"
    echo ""
    echo "Commands:"
    echo "  label <label>       - 특정 라벨을 가진 이슈들 추가"
    echo "  issues <numbers>    - 특정 이슈 번호들 추가 (공백으로 구분)"
    echo "  isms               - 모든 ISMS-P 관련 이슈들 추가"
    echo "  t012               - T012 Critical Risk 이슈들 추가"
    echo "  list               - 프로젝트 내 이슈 목록 조회"
    echo "  status             - 프로젝트 현황 및 통계"
    echo "  help               - 도움말 표시"
    echo ""
    echo "예시:"
    echo "  $0 label phase0"
    echo "  $0 issues 33 50 51 62"
    echo "  $0 isms"
    echo "  $0 status"
    echo ""
}

# 메인 함수
function main() {
    check_requirements
    
    case "${1:-help}" in
        "label")
            if [[ -z "$2" ]]; then
                log_error "라벨을 지정해주세요."
                show_help
                exit 1
            fi
            add_issues_by_label "$2"
            ;;
        "issues")
            shift
            if [[ $# -eq 0 ]]; then
                log_error "이슈 번호들을 지정해주세요."
                show_help
                exit 1
            fi
            add_specific_issues "$@"
            ;;
        "isms")
            add_isms_issues
            ;;
        "t012")
            add_t012_issues
            ;;
        "list")
            list_project_issues
            ;;
        "status")
            show_project_status
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# 스크립트 실행
main "$@"
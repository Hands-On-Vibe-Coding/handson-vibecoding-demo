#!/bin/bash

# GitHub Pages URL 자동 가져오기 스크립트
# GitHub CLI를 사용하여 배포된 Pages URL을 동적으로 가져옵니다.

set -e

# GitHub CLI 설치 확인
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI가 설치되지 않았습니다." >&2
    echo "설치: https://cli.github.com/" >&2
    exit 1
fi

# GitHub 인증 확인
if ! gh auth status &> /dev/null; then
    echo "❌ GitHub CLI 인증이 필요합니다." >&2
    echo "실행: gh auth login" >&2
    exit 1
fi

# 저장소 정보 자동 감지 (origin 원격 저장소 기준)
ORIGIN_URL=$(git remote get-url origin 2>/dev/null || echo "")

if [[ -z "$ORIGIN_URL" ]]; then
    echo "❌ Git 저장소에 origin 원격 저장소가 설정되지 않았습니다." >&2
    exit 1
fi

# GitHub URL에서 owner와 repo 이름 추출
# 형식: git@github.com:owner/repo.git 또는 https://github.com/owner/repo.git
if [[ "$ORIGIN_URL" =~ github\.com[:/]([^/]+)/([^/]+)(\.git)?$ ]]; then
    REPO_OWNER="${BASH_REMATCH[1]}"
    REPO_NAME="${BASH_REMATCH[2]%.git}"  # .git 확장자 제거
else
    echo "❌ origin 원격 저장소가 GitHub 저장소가 아닙니다: $ORIGIN_URL" >&2
    exit 1
fi

echo "📍 저장소: $REPO_OWNER/$REPO_NAME" >&2

# GitHub Pages 설정 확인
PAGES_INFO=$(gh api "repos/$REPO_OWNER/$REPO_NAME/pages" 2>/dev/null || echo "")

if [[ -z "$PAGES_INFO" ]]; then
    echo "❌ GitHub Pages가 설정되지 않았거나 배포되지 않았습니다." >&2
    echo "GitHub 저장소 Settings > Pages에서 GitHub Pages를 먼저 설정해주세요." >&2
    exit 1
fi

# 표준 GitHub Pages URL 생성 (커스텀 도메인 대신)
# 형식: https://{owner}.github.io/{repo}/ (소문자 변환)
PAGES_URL="https://$(echo ${REPO_OWNER} | tr '[:upper:]' '[:lower:]').github.io/${REPO_NAME}/"

echo "🌐 GitHub Pages URL: $PAGES_URL" >&2
echo "$PAGES_URL"
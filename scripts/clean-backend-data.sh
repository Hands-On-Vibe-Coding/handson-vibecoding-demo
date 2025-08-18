#!/bin/bash

# 백엔드 테스트 데이터 정리 스크립트

set -e

API_ENDPOINT="https://tb94v9s3jb.execute-api.ap-northeast-2.amazonaws.com/prod"

echo "🧹 백엔드 테스트 데이터 정리 시작..."

# 모든 Todo ID 가져오기
TODO_IDS=$(curl -s -X GET "$API_ENDPOINT/todos" | jq -r '.[] | .id')

if [ -z "$TODO_IDS" ]; then
    echo "✅ 삭제할 데이터가 없습니다."
    exit 0
fi

# 총 개수 확인
TOTAL_COUNT=$(echo "$TODO_IDS" | wc -l | tr -d ' ')
echo "📋 총 $TOTAL_COUNT 개의 Todo 항목을 삭제합니다..."

# 각 Todo 삭제
DELETED_COUNT=0
for todo_id in $TODO_IDS; do
    echo "🗑️  삭제 중: $todo_id"
    
    RESPONSE=$(curl -s -w "%{http_code}" -X DELETE "$API_ENDPOINT/todos/$todo_id")
    HTTP_CODE="${RESPONSE: -3}"
    
    if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 204 ]; then
        DELETED_COUNT=$((DELETED_COUNT + 1))
        echo "   ✅ 성공 (HTTP $HTTP_CODE)"
    else
        echo "   ❌ 실패 (HTTP $HTTP_CODE)"
        echo "   응답: ${RESPONSE%???}"
    fi
    
    # API 요청 제한 방지를 위한 짧은 대기
    sleep 0.1
done

echo ""
echo "🎉 정리 완료: $DELETED_COUNT/$TOTAL_COUNT 개 항목 삭제"

# 삭제 후 확인
REMAINING_COUNT=$(curl -s -X GET "$API_ENDPOINT/todos" | jq '. | length')
echo "📊 남은 항목 수: $REMAINING_COUNT"

if [ "$REMAINING_COUNT" -eq 0 ]; then
    echo "✅ 모든 테스트 데이터가 성공적으로 정리되었습니다!"
else
    echo "⚠️  일부 데이터가 남아있습니다. 수동 확인이 필요할 수 있습니다."
fi
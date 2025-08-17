# 모니터링 및 로깅 설계

## 1. CloudWatch 메트릭

### 1.1 Lambda 메트릭
```typescript
const lambdaMetrics = {
  duration: {
    statistic: 'Average',
    period: 300,
    threshold: 1000, // 1초
  },
  errors: {
    statistic: 'Sum',
    period: 300,
    threshold: 0,
  },
  throttles: {
    statistic: 'Sum',
    period: 300,
    threshold: 0,
  },
  concurrentExecutions: {
    statistic: 'Maximum',
    period: 300,
    threshold: 1000,
  },
};
```

### 1.2 API Gateway 메트릭
```typescript
const apiMetrics = {
  latency: {
    statistic: 'Average',
    period: 300,
    threshold: 100, // 100ms
  },
  '4xxErrors': {
    statistic: 'Sum',
    period: 300,
    threshold: 0,
  },
  '5xxErrors': {
    statistic: 'Sum',
    period: 300,
    threshold: 0,
  },
  requestCount: {
    statistic: 'Sum',
    period: 300,
    threshold: 1000,
  },
};
```

## 2. 알람 설정

### 2.1 성능 알람
```typescript
const performanceAlarms = {
  highLatency: {
    metric: 'Latency',
    threshold: 1000,
    evaluationPeriods: 2,
    period: 300,
    comparisonOperator: 'GreaterThanThreshold',
    treatMissingData: 'notBreaching',
  },
  highErrorRate: {
    metric: 'ErrorRate',
    threshold: 1,
    evaluationPeriods: 2,
    period: 300,
    comparisonOperator: 'GreaterThanThreshold',
    treatMissingData: 'notBreaching',
  },
};
```

### 2.2 비용 알람
```typescript
const costAlarms = {
  highCost: {
    metric: 'EstimatedCharges',
    threshold: 100,
    evaluationPeriods: 1,
    period: 86400, // 24시간
    comparisonOperator: 'GreaterThanThreshold',
    treatMissingData: 'notBreaching',
  },
  unusualSpike: {
    metric: 'EstimatedCharges',
    threshold: 50,
    evaluationPeriods: 1,
    period: 3600, // 1시간
    comparisonOperator: 'GreaterThanThreshold',
    treatMissingData: 'notBreaching',
  },
};
```

## 3. 로깅 전략

### 3.1 로그 레벨
```typescript
const logLevels = {
  error: {
    level: 'ERROR',
    retention: RetentionDays.ONE_MONTH,
    filter: 'ERROR',
  },
  warn: {
    level: 'WARN',
    retention: RetentionDays.ONE_WEEK,
    filter: 'WARN',
  },
  info: {
    level: 'INFO',
    retention: RetentionDays.THREE_DAYS,
    filter: 'INFO',
  },
  debug: {
    level: 'DEBUG',
    retention: RetentionDays.ONE_DAY,
    filter: 'DEBUG',
  },
};
```

### 3.2 로그 포맷
```typescript
const logFormat = {
  timestamp: 'ISO8601',
  level: 'string',
  requestId: 'string',
  userId: 'string',
  action: 'string',
  resource: 'string',
  duration: 'number',
  error: 'object?',
  metadata: 'object?',
};
```

## 4. 대시보드

### 4.1 CloudWatch Dashboard 구현 (CDK)
AWS CDK를 사용하여 CloudWatch Dashboard를 구현하였습니다.

#### MonitoringStack 구성 요소
- **Lambda 함수 모니터링**: 호출 횟수, 오류율, 실행 시간, 동시 실행 수, 스로틀링, 성공률
- **API Gateway 모니터링**: 요청 수, 응답 시간 (평균/최소/최대/P99), HTTP 상태 코드, 캐시 히트율
- **DynamoDB 모니터링**: 읽기/쓰기 용량 사용률, 스로틀링, 시스템 오류, 사용자 오류, 응답 시간
- **통합 시스템 상태**: 전체 시스템의 오류 현황 및 상태 요약

#### 구현된 위젯 목록
1. **Lambda 메트릭 위젯**
   - 호출 횟수 그래프
   - 오류율 시계열 차트
   - 평균 실행 시간 추적
   - 동시 실행 수 모니터링
   - 스로틀링 이벤트
   - 성공률 계산 (MathExpression 사용)

2. **API Gateway 메트릭 위젯**
   - API 요청 수 추적
   - 응답 시간 분포 (평균, 최소, 최대, P99)
   - HTTP 상태 코드별 분류 (4xx, 5xx)
   - 캐시 히트/미스 통계

3. **DynamoDB 메트릭 위젯**
   - 읽기/쓰기 용량 사용률
   - 스로틀링 이벤트 추적
   - 시스템 오류 모니터링
   - 사용자 오류 추적
   - 작업별 응답 시간 (GetItem, PutItem, Query, Scan)

#### 배포 방법
```bash
# CloudWatch Dashboard를 포함한 모든 스택 배포
cd backend
npx cdk deploy TodoAppMonitoringStack

# 또는 모든 스택 한번에 배포
npx cdk deploy --all
```

#### 대시보드 접근 방법
1. AWS Console에서 CloudWatch 서비스로 이동
2. 왼쪽 메뉴에서 "Dashboards" 선택
3. "TodoAppDashboard" 클릭하여 접근

### 4.2 운영 대시보드
```typescript
const operationalDashboard = {
  widgets: [
    {
      type: 'metric',
      properties: {
        metrics: [
          ['AWS/Lambda', 'Duration'],
          ['AWS/Lambda', 'Errors'],
          ['AWS/Lambda', 'Throttles'],
        ],
        period: 300,
        stat: 'Average',
        region: 'ap-northeast-2',
        title: 'Lambda Metrics',
      },
    },
    {
      type: 'metric',
      properties: {
        metrics: [
          ['AWS/ApiGateway', 'Latency'],
          ['AWS/ApiGateway', '4XXError'],
          ['AWS/ApiGateway', '5XXError'],
        ],
        period: 300,
        stat: 'Average',
        region: 'ap-northeast-2',
        title: 'API Gateway Metrics',
      },
    },
  ],
};
```

### 4.2 비즈니스 대시보드
```typescript
const businessDashboard = {
  widgets: [
    {
      type: 'metric',
      properties: {
        metrics: [
          ['Custom', 'ActiveUsers'],
          ['Custom', 'NewUsers'],
          ['Custom', 'CompletedTasks'],
        ],
        period: 3600,
        stat: 'Sum',
        region: 'ap-northeast-2',
        title: 'User Metrics',
      },
    },
    {
      type: 'metric',
      properties: {
        metrics: [
          ['Custom', 'TaskCreationRate'],
          ['Custom', 'TaskCompletionRate'],
          ['Custom', 'TaskDeletionRate'],
        ],
        period: 3600,
        stat: 'Sum',
        region: 'ap-northeast-2',
        title: 'Task Metrics',
      },
    },
  ],
};
```

## 5. 알림 설정

### 5.1 SNS 토픽
```typescript
const snsTopics = {
  alerts: {
    name: 'TodoAppAlerts',
    protocol: 'email',
    endpoint: 'alerts@example.com',
  },
  notifications: {
    name: 'TodoAppNotifications',
    protocol: 'email',
    endpoint: 'notifications@example.com',
  },
};
```

### 5.2 알림 규칙
```typescript
const notificationRules = {
  critical: {
    conditions: ['ERROR', 'CRITICAL'],
    channels: ['SMS', 'Email'],
    cooldown: 300, // 5분
  },
  warning: {
    conditions: ['WARNING'],
    channels: ['Email'],
    cooldown: 3600, // 1시간
  },
  info: {
    conditions: ['INFO'],
    channels: ['Email'],
    cooldown: 86400, // 24시간
  },
};
``` 
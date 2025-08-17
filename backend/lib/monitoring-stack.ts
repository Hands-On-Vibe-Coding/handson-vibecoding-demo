import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface MonitoringStackProps extends cdk.StackProps {
  /**
   * Lambda 함수들 (모니터링 대상)
   */
  lambdaFunctions?: lambda.Function[];

  /**
   * API Gateway REST API (모니터링 대상)
   */
  restApi?: apigateway.RestApi;

  /**
   * DynamoDB 테이블 (모니터링 대상)
   */
  dynamoDbTable?: dynamodb.Table;

  /**
   * 대시보드 이름
   */
  dashboardName?: string;
}

export class MonitoringStack extends cdk.Stack {
  public readonly dashboard: cloudwatch.Dashboard;

  constructor(scope: Construct, id: string, props?: MonitoringStackProps) {
    super(scope, id, props);

    const dashboardName = props?.dashboardName || 'TodoAppDashboard';

    // CloudWatch Dashboard 생성
    this.dashboard = new cloudwatch.Dashboard(this, 'Dashboard', {
      dashboardName,
      periodOverride: cloudwatch.PeriodOverride.AUTO,
      defaultInterval: cdk.Duration.hours(3),
    });

    // 시스템 개요 섹션 - 타이틀 위젯
    const titleWidget = new cloudwatch.TextWidget({
      markdown: `# 📊 Todo App 모니터링 대시보드
## 시스템 상태 및 성능 메트릭
      
**환경**: ${this.stackName}  
**리전**: ${this.region}  
**마지막 업데이트**: CloudWatch 자동 새로고침`,
      width: 24,
      height: 2,
    });

    this.dashboard.addWidgets(titleWidget);

    // Lambda 함수 모니터링 섹션
    if (props?.lambdaFunctions && props.lambdaFunctions.length > 0) {
      this.addLambdaMonitoring(props.lambdaFunctions);
    }

    // API Gateway 모니터링 섹션
    if (props?.restApi) {
      this.addApiGatewayMonitoring(props.restApi);
    }

    // DynamoDB 모니터링 섹션
    if (props?.dynamoDbTable) {
      this.addDynamoDbMonitoring(props.dynamoDbTable);
    }

    // 통합 시스템 상태 섹션
    this.addSystemHealthOverview(props);
  }

  /**
   * Lambda 함수 모니터링 위젯 추가
   */
  private addLambdaMonitoring(functions: lambda.Function[]): void {
    // Lambda 섹션 타이틀
    const lambdaSectionTitle = new cloudwatch.TextWidget({
      markdown: '## ⚡ Lambda Functions',
      width: 24,
      height: 1,
    });

    // Lambda 호출 횟수
    const invocationsWidget = new cloudwatch.GraphWidget({
      title: 'Lambda 호출 횟수',
      width: 12,
      height: 6,
      left: functions.map((fn) =>
        fn.metricInvocations({
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
        }),
      ),
      leftYAxis: {
        label: '호출 횟수',
        showUnits: false,
      },
      legendPosition: cloudwatch.LegendPosition.BOTTOM,
      stacked: false,
    });

    // Lambda 오류율
    const errorWidget = new cloudwatch.GraphWidget({
      title: 'Lambda 오류율',
      width: 12,
      height: 6,
      left: functions.map((fn) =>
        fn.metricErrors({
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
        }),
      ),
      leftYAxis: {
        label: '오류 횟수',
        showUnits: false,
      },
      legendPosition: cloudwatch.LegendPosition.BOTTOM,
      view: cloudwatch.GraphWidgetView.TIME_SERIES,
    });

    // Lambda 실행 시간
    const durationWidget = new cloudwatch.GraphWidget({
      title: 'Lambda 실행 시간',
      width: 12,
      height: 6,
      left: functions.map((fn) =>
        fn.metricDuration({
          statistic: 'Average',
          period: cdk.Duration.minutes(5),
        }),
      ),
      leftYAxis: {
        label: '실행 시간 (ms)',
        showUnits: false,
      },
      legendPosition: cloudwatch.LegendPosition.BOTTOM,
    });

    // Lambda 동시 실행 수
    const concurrentWidget = new cloudwatch.GraphWidget({
      title: 'Lambda 동시 실행 수',
      width: 12,
      height: 6,
      left: functions.map(
        (fn) =>
          new cloudwatch.Metric({
            namespace: 'AWS/Lambda',
            metricName: 'ConcurrentExecutions',
            dimensionsMap: {
              FunctionName: fn.functionName,
            },
            statistic: 'Maximum',
            period: cdk.Duration.minutes(5),
            label: fn.functionName,
          }),
      ),
      leftYAxis: {
        label: '동시 실행 수',
        showUnits: false,
      },
      legendPosition: cloudwatch.LegendPosition.BOTTOM,
    });

    // Lambda 스로틀링
    const throttleWidget = new cloudwatch.GraphWidget({
      title: 'Lambda 스로틀링',
      width: 12,
      height: 6,
      left: functions.map((fn) =>
        fn.metricThrottles({
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
        }),
      ),
      leftYAxis: {
        label: '스로틀 횟수',
        showUnits: false,
      },
      legendPosition: cloudwatch.LegendPosition.BOTTOM,
    });

    // Lambda 성공률 (계산된 메트릭)
    const successRateWidget = new cloudwatch.GraphWidget({
      title: 'Lambda 성공률 (%)',
      width: 12,
      height: 6,
      left: functions.map((fn, index) => {
        const invocations = fn.metricInvocations({ statistic: 'Sum' });
        const errors = fn.metricErrors({ statistic: 'Sum' });
        return new cloudwatch.MathExpression({
          expression: `100 - (errors${index} / invocations${index} * 100)`,
          usingMetrics: {
            [`invocations${index}`]: invocations,
            [`errors${index}`]: errors,
          },
          label: fn.functionName,
          period: cdk.Duration.minutes(5),
        });
      }),
      leftYAxis: {
        label: '성공률 (%)',
        showUnits: false,
        min: 0,
        max: 100,
      },
      legendPosition: cloudwatch.LegendPosition.BOTTOM,
    });

    this.dashboard.addWidgets(lambdaSectionTitle);
    this.dashboard.addWidgets(invocationsWidget, errorWidget);
    this.dashboard.addWidgets(durationWidget, concurrentWidget);
    this.dashboard.addWidgets(throttleWidget, successRateWidget);
  }

  /**
   * API Gateway 모니터링 위젯 추가
   */
  private addApiGatewayMonitoring(api: apigateway.RestApi): void {
    // API Gateway 섹션 타이틀
    const apiSectionTitle = new cloudwatch.TextWidget({
      markdown: '## 🌐 API Gateway',
      width: 24,
      height: 1,
    });

    // API 요청 수
    const requestCountWidget = new cloudwatch.GraphWidget({
      title: 'API 요청 수',
      width: 12,
      height: 6,
      left: [
        api.metricCount({
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
        }),
      ],
      leftYAxis: {
        label: '요청 수',
        showUnits: false,
      },
    });

    // API 응답 시간
    const latencyWidget = new cloudwatch.GraphWidget({
      title: 'API 응답 시간',
      width: 12,
      height: 6,
      left: [
        api.metricLatency({
          statistic: 'Average',
          period: cdk.Duration.minutes(5),
          label: '평균',
        }),
        api.metricLatency({
          statistic: 'Minimum',
          period: cdk.Duration.minutes(5),
          label: '최소',
        }),
        api.metricLatency({
          statistic: 'Maximum',
          period: cdk.Duration.minutes(5),
          label: '최대',
        }),
        api.metricLatency({
          statistic: cloudwatch.Stats.percentile(99),
          period: cdk.Duration.minutes(5),
          label: 'P99',
        }),
      ],
      leftYAxis: {
        label: '응답 시간 (ms)',
        showUnits: false,
      },
      legendPosition: cloudwatch.LegendPosition.BOTTOM,
    });

    // HTTP 상태 코드별 응답
    const httpStatusWidget = new cloudwatch.GraphWidget({
      title: 'HTTP 상태 코드',
      width: 12,
      height: 6,
      left: [
        api.metricClientError({
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
          label: '4xx 오류',
        }),
        api.metricServerError({
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
          label: '5xx 오류',
        }),
      ],
      leftYAxis: {
        label: '오류 수',
        showUnits: false,
      },
      legendPosition: cloudwatch.LegendPosition.BOTTOM,
      view: cloudwatch.GraphWidgetView.TIME_SERIES,
    });

    // API 캐시 히트율 (캐시가 활성화된 경우)
    const cacheHitWidget = new cloudwatch.GraphWidget({
      title: 'API 캐시 히트율',
      width: 12,
      height: 6,
      left: [
        api.metricCacheHitCount({
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
          label: '캐시 히트',
        }),
        api.metricCacheMissCount({
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
          label: '캐시 미스',
        }),
      ],
      leftYAxis: {
        label: '횟수',
        showUnits: false,
      },
      legendPosition: cloudwatch.LegendPosition.BOTTOM,
    });

    this.dashboard.addWidgets(apiSectionTitle);
    this.dashboard.addWidgets(requestCountWidget, latencyWidget);
    this.dashboard.addWidgets(httpStatusWidget, cacheHitWidget);
  }

  /**
   * DynamoDB 모니터링 위젯 추가
   */
  private addDynamoDbMonitoring(table: dynamodb.Table): void {
    // DynamoDB 섹션 타이틀
    const dynamoSectionTitle = new cloudwatch.TextWidget({
      markdown: '## 🗄️ DynamoDB',
      width: 24,
      height: 1,
    });

    // 읽기/쓰기 용량 사용률
    const capacityWidget = new cloudwatch.GraphWidget({
      title: 'DynamoDB 용량 사용률',
      width: 12,
      height: 6,
      left: [
        table.metricConsumedReadCapacityUnits({
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
          label: '읽기 용량',
        }),
        table.metricConsumedWriteCapacityUnits({
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
          label: '쓰기 용량',
        }),
      ],
      leftYAxis: {
        label: '용량 단위',
        showUnits: false,
      },
      legendPosition: cloudwatch.LegendPosition.BOTTOM,
    });

    // 스로틀된 요청
    const throttleWidget = new cloudwatch.GraphWidget({
      title: 'DynamoDB 스로틀링',
      width: 12,
      height: 6,
      left: [
        new cloudwatch.Metric({
          namespace: 'AWS/DynamoDB',
          metricName: 'ReadThrottleEvents',
          dimensionsMap: {
            TableName: table.tableName,
          },
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
          label: '읽기 스로틀',
        }),
        new cloudwatch.Metric({
          namespace: 'AWS/DynamoDB',
          metricName: 'WriteThrottleEvents',
          dimensionsMap: {
            TableName: table.tableName,
          },
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
          label: '쓰기 스로틀',
        }),
      ],
      leftYAxis: {
        label: '스로틀 이벤트',
        showUnits: false,
      },
      legendPosition: cloudwatch.LegendPosition.BOTTOM,
    });

    // 시스템 오류
    const systemErrorWidget = new cloudwatch.GraphWidget({
      title: 'DynamoDB 시스템 오류',
      width: 12,
      height: 6,
      left: [
        table.metricSystemErrorsForOperations({
          operations: [dynamodb.Operation.GET_ITEM, dynamodb.Operation.PUT_ITEM],
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
        }),
      ],
      leftYAxis: {
        label: '오류 수',
        showUnits: false,
      },
    });

    // 사용자 오류
    const userErrorWidget = new cloudwatch.GraphWidget({
      title: 'DynamoDB 사용자 오류',
      width: 12,
      height: 6,
      left: [
        table.metricUserErrors({
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
        }),
      ],
      leftYAxis: {
        label: '오류 수',
        showUnits: false,
      },
    });

    // 성공한 요청 응답 시간
    const latencyWidget = new cloudwatch.GraphWidget({
      title: 'DynamoDB 응답 시간',
      width: 24,
      height: 6,
      left: [
        table.metricSuccessfulRequestLatency({
          dimensionsMap: { Operation: 'GetItem' },
          statistic: 'Average',
          period: cdk.Duration.minutes(5),
          label: 'GetItem 평균',
        }),
        table.metricSuccessfulRequestLatency({
          dimensionsMap: { Operation: 'PutItem' },
          statistic: 'Average',
          period: cdk.Duration.minutes(5),
          label: 'PutItem 평균',
        }),
        table.metricSuccessfulRequestLatency({
          dimensionsMap: { Operation: 'Query' },
          statistic: 'Average',
          period: cdk.Duration.minutes(5),
          label: 'Query 평균',
        }),
        table.metricSuccessfulRequestLatency({
          dimensionsMap: { Operation: 'Scan' },
          statistic: 'Average',
          period: cdk.Duration.minutes(5),
          label: 'Scan 평균',
        }),
      ],
      leftYAxis: {
        label: '응답 시간 (ms)',
        showUnits: false,
      },
      legendPosition: cloudwatch.LegendPosition.BOTTOM,
    });

    this.dashboard.addWidgets(dynamoSectionTitle);
    this.dashboard.addWidgets(capacityWidget, throttleWidget);
    this.dashboard.addWidgets(systemErrorWidget, userErrorWidget);
    this.dashboard.addWidgets(latencyWidget);
  }

  /**
   * 통합 시스템 상태 개요 추가
   */
  private addSystemHealthOverview(props?: MonitoringStackProps): void {
    // 시스템 상태 섹션 타이틀
    const healthSectionTitle = new cloudwatch.TextWidget({
      markdown: '## 🏥 시스템 상태 개요',
      width: 24,
      height: 1,
    });

    // 통합 오류율 위젯
    const metrics: cloudwatch.IMetric[] = [];

    if (props?.lambdaFunctions) {
      props.lambdaFunctions.forEach((fn) => {
        metrics.push(
          fn.metricErrors({
            statistic: 'Sum',
            period: cdk.Duration.minutes(5),
            label: `Lambda: ${fn.functionName}`,
          }),
        );
      });
    }

    if (props?.restApi) {
      metrics.push(
        props.restApi.metricServerError({
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
          label: 'API Gateway 5xx',
        }),
      );
    }

    if (props?.dynamoDbTable) {
      metrics.push(
        props.dynamoDbTable.metricSystemErrorsForOperations({
          operations: [dynamodb.Operation.GET_ITEM, dynamodb.Operation.PUT_ITEM],
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
          label: 'DynamoDB 시스템 오류',
        }),
      );
    }

    if (metrics.length > 0) {
      const errorOverviewWidget = new cloudwatch.GraphWidget({
        title: '전체 시스템 오류 현황',
        width: 24,
        height: 6,
        left: metrics,
        leftYAxis: {
          label: '오류 수',
          showUnits: false,
        },
        legendPosition: cloudwatch.LegendPosition.RIGHT,
        stacked: true,
        view: cloudwatch.GraphWidgetView.TIME_SERIES,
      });

      this.dashboard.addWidgets(healthSectionTitle);
      this.dashboard.addWidgets(errorOverviewWidget);
    }

    // 시스템 요약 통계 위젯
    const summaryWidget = new cloudwatch.TextWidget({
      markdown: `### 📈 모니터링 요약
      
**모니터링 대상:**
- Lambda Functions: ${props?.lambdaFunctions?.length || 0}개
- API Gateway: ${props?.restApi ? '1개' : '0개'}
- DynamoDB Tables: ${props?.dynamoDbTable ? '1개' : '0개'}

**대시보드 업데이트 주기:** 5분
**기본 표시 기간:** 최근 3시간

---
💡 **Tip**: 그래프를 클릭하여 세부 메트릭을 확인하거나 시간 범위를 조정할 수 있습니다.`,
      width: 24,
      height: 4,
    });

    this.dashboard.addWidgets(summaryWidget);
  }
}

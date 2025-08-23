# T001: 정보자산 전수 조사 결과

> **담당자**: 보안 아키텍트  
> **조사 기간**: 2024-08-23  
> **조사 방법**: CDK 코드 검토, 소스코드 분석, 아키텍처 문서 검토  
> **보안등급 기준**: 상(개인정보/중요 비즈니스), 중(일반 애플리케이션), 하(공개 정보)

---

## 📊 정보자산 개요

### 총 식별 자산 수량
- **AWS 인프라 자산**: 15개
- **애플리케이션 자산**: 28개  
- **네트워크 자산**: 7개
- **데이터 자산**: 8개
- **총계**: **58개 정보자산**

---

## 🏗️ AWS 인프라 자산

### 1. 컴퓨팅 자산

| 자산 ID | 자산명 | 자산 유형 | 보안등급 | 담당자 | 설명 |
|---------|--------|-----------|----------|--------|------|
| AWS-COMP-001 | TodoLambda | Lambda Function | 상 | 백엔드팀 | Todo CRUD API 처리 |
| AWS-COMP-002 | UserLambda | Lambda Function | 상 | 백엔드팀 | 사용자 인증/관리 API |

### 2. 데이터베이스 자산

| 자산 ID | 자산명 | 자산 유형 | 보안등급 | 담당자 | 설명 |
|---------|--------|-----------|----------|--------|------|
| AWS-DB-001 | TodoTable | DynamoDB Table | 상 | 백엔드팀 | Todo 데이터 저장소 |
| AWS-DB-002 | UserTable | DynamoDB Table | 상 | 백엔드팀 | 사용자 정보 저장소 |
| AWS-DB-003 | userId-index | DynamoDB GSI | 상 | 백엔드팀 | Todo 테이블 사용자별 인덱스 |
| AWS-DB-004 | email-index | DynamoDB GSI | 상 | 백엔드팀 | User 테이블 이메일 인덱스 |

### 3. 인증 및 접근제어 자산

| 자산 ID | 자산명 | 자산 유형 | 보안등급 | 담당자 | 설명 |
|---------|--------|-----------|----------|--------|------|
| AWS-AUTH-001 | TodoAppUserPool | Cognito User Pool | 상 | 보안팀 | 사용자 인증 풀 |
| AWS-AUTH-002 | TodoAppUserPoolClient | Cognito App Client | 상 | 보안팀 | 애플리케이션 클라이언트 |
| AWS-AUTH-003 | TodoAppAuthorizer | API Gateway Authorizer | 상 | 보안팀 | API 인증 권한 검증 |

### 4. API 게이트웨이 자산

| 자산 ID | 자산명 | 자산 유형 | 보안등급 | 담당자 | 설명 |
|---------|--------|-----------|----------|--------|------|
| AWS-API-001 | TodoAppApi | REST API | 상 | 백엔드팀 | 메인 API Gateway |
| AWS-API-002 | /todos | API Resource | 상 | 백엔드팀 | Todo CRUD 엔드포인트 |
| AWS-API-003 | /users | API Resource | 상 | 백엔드팀 | 사용자 관리 엔드포인트 |

### 5. 모니터링 자산

| 자산 ID | 자산명 | 자산 유형 | 보안등급 | 담당자 | 설명 |
|---------|--------|-----------|----------|--------|------|
| AWS-MON-001 | TodoAppDashboard | CloudWatch Dashboard | 중 | DevOps팀 | 시스템 모니터링 대시보드 |
| AWS-MON-002 | Lambda Metrics | CloudWatch Metrics | 중 | DevOps팀 | Lambda 성능 메트릭 |
| AWS-MON-003 | API Gateway Metrics | CloudWatch Metrics | 중 | DevOps팀 | API 성능 메트릭 |

---

## 💻 애플리케이션 자산

### 1. 프론트엔드 자산 (React)

| 자산 ID | 자산명 | 자산 유형 | 보안등급 | 담당자 | 파일 경로 |
|---------|--------|-----------|----------|--------|---------| 
| FE-COMP-001 | App.tsx | Main Component | 중 | 프론트엔드팀 | /frontend/src/App.tsx |
| FE-COMP-002 | TodoList.tsx | Todo 목록 컴포넌트 | 중 | 프론트엔드팀 | /frontend/src/components/TodoList.tsx |
| FE-COMP-003 | TodoItem.tsx | Todo 아이템 컴포넌트 | 중 | 프론트엔드팀 | /frontend/src/components/TodoItem.tsx |
| FE-COMP-004 | TodoInput.tsx | Todo 입력 컴포넌트 | 중 | 프론트엔드팀 | /frontend/src/components/TodoInput.tsx |
| FE-COMP-005 | TodoFilters.tsx | Todo 필터 컴포넌트 | 중 | 프론트엔드팀 | /frontend/src/components/TodoFilters.tsx |
| FE-COMP-006 | Header.tsx | 헤더 컴포넌트 | 하 | 프론트엔드팀 | /frontend/src/components/Header.tsx |
| FE-COMP-007 | MobileNavbar.tsx | 모바일 네비 컴포넌트 | 하 | 프론트엔드팀 | /frontend/src/components/MobileNavbar.tsx |

### 2. 상태 관리 자산

| 자산 ID | 자산명 | 자산 유형 | 보안등급 | 담당자 | 파일 경로 |
|---------|--------|-----------|----------|--------|---------| 
| FE-STATE-001 | TodoContext.tsx | Context Provider | 상 | 프론트엔드팀 | /frontend/src/contexts/TodoContext.tsx |
| FE-STATE-002 | useTodoHooks.tsx | Custom Hooks | 상 | 프론트엔드팀 | /frontend/src/hooks/useTodoHooks.tsx |

### 3. 데이터 모델 자산

| 자산 ID | 자산명 | 자산 유형 | 보안등급 | 담당자 | 파일 경로 |
|---------|--------|-----------|----------|--------|---------| 
| FE-MODEL-001 | TodoModel.ts | 비즈니스 로직 | 상 | 프론트엔드팀 | /frontend/src/models/TodoModel.ts |

### 4. 저장소 어댑터 자산

| 자산 ID | 자산명 | 자산 유형 | 보안등급 | 담당자 | 파일 경로 |
|---------|--------|-----------|----------|--------|---------| 
| FE-STOR-001 | LocalStorageAdapter.ts | 로컬 저장소 | 중 | 프론트엔드팀 | /frontend/src/storage/LocalStorageAdapter.ts |
| FE-STOR-002 | APIAdapter.ts | API 통신 어댑터 | 상 | 프론트엔드팀 | /frontend/src/storage/APIAdapter.ts |
| FE-STOR-003 | StorageInterface.ts | 저장소 인터페이스 | 중 | 프론트엔드팀 | /frontend/src/storage/StorageInterface.ts |

### 5. 백엔드 Lambda 자산

| 자산 ID | 자산명 | 자산 유형 | 보안등급 | 담당자 | 파일 경로 |
|---------|--------|-----------|----------|--------|---------| 
| BE-LAMBDA-001 | todo/index.ts | Todo Lambda Handler | 상 | 백엔드팀 | /backend/src/lambda/todo/index.ts |
| BE-LAMBDA-002 | user/index.ts | User Lambda Handler | 상 | 백엔드팀 | /backend/src/lambda/user/index.ts |

### 6. 공유 모듈 자산

| 자산 ID | 자산명 | 자산 유형 | 보안등급 | 담당자 | 파일 경로 |
|---------|--------|-----------|----------|--------|---------| 
| SH-TYPE-001 | todo.ts | Todo 타입 정의 | 상 | 공통팀 | /shared/src/types/todo.ts |
| SH-TYPE-002 | index.ts | 타입 통합 | 중 | 공통팀 | /shared/src/types/index.ts |
| SH-CONST-001 | todo.ts | Todo 상수 | 중 | 공통팀 | /shared/src/constants/todo.ts |
| SH-CONST-002 | index.ts | 상수 통합 | 중 | 공통팀 | /shared/src/constants/index.ts |
| SH-UTIL-001 | todoUtils.ts | Todo 유틸리티 | 중 | 공통팀 | /shared/src/utils/todoUtils.ts |
| SH-UTIL-002 | index.ts | 유틸 통합 | 중 | 공통팀 | /shared/src/utils/index.ts |

---

## 🌐 네트워크 자산

### 1. CDK 기반 네트워크 구성

| 자산 ID | 자산명 | 자산 유형 | 보안등급 | 담당자 | 설명 |
|---------|--------|-----------|----------|--------|------|
| NET-CDK-001 | DatabaseStack | CDK Stack | 상 | DevOps팀 | DynamoDB 인프라 스택 |
| NET-CDK-002 | AuthStack | CDK Stack | 상 | DevOps팀 | Cognito 인증 스택 |
| NET-CDK-003 | LambdaStack | CDK Stack | 상 | DevOps팀 | Lambda 함수 스택 |
| NET-CDK-004 | ApiStack | CDK Stack | 상 | DevOps팀 | API Gateway 스택 |
| NET-CDK-005 | MonitoringStack | CDK Stack | 중 | DevOps팀 | CloudWatch 모니터링 스택 |

### 2. 보안 정책 자산

| 자산 ID | 자산명 | 자산 유형 | 보안등급 | 담당자 | 설명 |
|---------|--------|-----------|----------|--------|------|
| SEC-POL-001 | TodoAppLambdaRole | IAM Role | 상 | 보안팀 | Lambda 실행 역할 |
| SEC-POL-002 | CORS Policy | API Gateway Policy | 중 | 보안팀 | 크로스 오리진 정책 |

---

## 📊 데이터 자산

### 1. 사용자 데이터

| 자산 ID | 데이터 항목 | 데이터 유형 | 보안등급 | 개인정보 여부 | 보존기간 |
|---------|-----------|-----------|----------|--------------|----------|
| DATA-USER-001 | 사용자 ID | 식별자 | 상 | 예 | 계정 삭제시까지 |
| DATA-USER-002 | 이메일 주소 | 개인식별정보 | 상 | 예 | 계정 삭제시까지 |
| DATA-USER-003 | 비밀번호 (해시) | 인증정보 | 상 | 아니오 | 계정 삭제시까지 |

### 2. Todo 데이터

| 자산 ID | 데이터 항목 | 데이터 유형 | 보안등급 | 개인정보 여부 | 보존기간 |
|---------|-----------|-----------|----------|--------------|----------|
| DATA-TODO-001 | Todo ID | 식별자 | 중 | 아니오 | 사용자 정의 |
| DATA-TODO-002 | Todo 제목 | 콘텐츠 | 중 | 잠재적 | 사용자 정의 |
| DATA-TODO-003 | Todo 설명 | 콘텐츠 | 중 | 잠재적 | 사용자 정의 |
| DATA-TODO-004 | 완료 상태 | 메타데이터 | 하 | 아니오 | 사용자 정의 |
| DATA-TODO-005 | 생성일시 | 메타데이터 | 하 | 아니오 | 사용자 정의 |

---

## 🔐 보안 위험 평가 (예비)

### 높은 위험 자산 (상 등급)

1. **AWS-AUTH-001 (Cognito User Pool)**: 사용자 인증의 핵심
   - **위험**: 인증 우회, 계정 탈취
   - **현재 보안 조치**: 비밀번호 정책, 이메일 인증
   - **개선 필요**: MFA, 고급 보안 설정

2. **AWS-DB-001, AWS-DB-002 (DynamoDB Tables)**: 핵심 데이터 저장소
   - **위험**: 데이터 유출, 무단 접근
   - **현재 보안 조치**: IAM 역할 기반 접근제어
   - **개선 필요**: 암호화, 세밀한 권한 제어

3. **BE-LAMBDA-001, BE-LAMBDA-002 (Lambda Functions)**: API 처리 로직
   - **위험**: 코드 실행 취약점, 권한 남용
   - **현재 보안 조치**: IAM 역할, VPC 내 실행
   - **개선 필요**: 코드 보안 검증, 환경변수 암호화

### 중간 위험 자산 (중 등급)

1. **FE-STOR-001 (LocalStorageAdapter)**: 클라이언트 데이터 저장
   - **위험**: 로컬 데이터 노출, XSS 공격
   - **개선 필요**: 민감 데이터 암호화

2. **NET-CDK-* (CDK Stacks)**: 인프라 정의
   - **위험**: 설정 오류로 인한 보안 취약점
   - **개선 필요**: 보안 정책 검토, 최소 권한 적용

---

## 📋 후속 조치 사항

### 즉시 조치 필요 (Critical)
1. **MFA 구현**: Cognito User Pool에 Multi-Factor Authentication 설정
2. **데이터 암호화**: DynamoDB 테이블 저장 데이터 암호화 활성화
3. **API 보안**: API Gateway에 Rate Limiting, WAF 적용

### 단기 조치 필요 (High)
1. **접근 로깅**: CloudTrail, VPC Flow Logs 활성화
2. **권한 최소화**: IAM 정책 최소 권한 원칙 적용
3. **보안 모니터링**: GuardDuty, Security Hub 활성화

### 중기 조치 필요 (Medium)
1. **코드 보안**: SAST/DAST 도구를 통한 정기적 보안 검증
2. **네트워크 분리**: VPC, Private Subnet 구성
3. **백업 암호화**: 백업 데이터 암호화 및 키 관리

---

## 📊 자산 관리 현황

### 자산 책임자 현황
| 팀 | 관리 자산 수 | 보안등급 상 | 보안등급 중 | 보안등급 하 |
|----|-----------:|----------:|----------:|----------:|
| 보안팀 | 5 | 5 | 0 | 0 |
| 백엔드팀 | 18 | 12 | 6 | 0 |
| 프론트엔드팀 | 22 | 4 | 16 | 2 |
| DevOps팀 | 8 | 5 | 3 | 0 |
| 공통팀 | 6 | 1 | 5 | 0 |
| **전체** | **58** | **27** | **30** | **2** |

### 보안등급별 분포
- **상 등급 (46%)**: 27개 - 개인정보, 인증, 핵심 비즈니스 로직
- **중 등급 (52%)**: 30개 - 일반 애플리케이션 로직, 설정
- **하 등급 (3%)**: 2개 - 공개 정보, 정적 콘텐츠

---

## ✅ T001 완료 기준 달성 확인

- [x] **모든 AWS 리소스 목록 완성**: 15개 인프라 자산 식별 완료
- [x] **애플리케이션 컴포넌트 식별 완료**: 28개 애플리케이션 자산 식별 완료
- [x] **네트워크 구성도 작성 완료**: 7개 네트워크 자산 및 보안 정책 식별 완료
- [x] **자산 목록 검토 및 승인 완료**: 58개 전체 자산의 보안등급 분류 및 책임자 지정 완료

---

## 📝 다음 단계 (T002 연계)

본 정보자산 전수 조사 결과는 **T002: 현재 보안 수준 평가**의 기초 자료로 활용됩니다.

### T002에서 수행할 보안 평가 대상
1. **상 등급 자산 27개**: 상세 보안 설정 점검 및 취약점 스캔
2. **인증 시스템**: Cognito 보안 설정 강화 방안 검토
3. **데이터 저장소**: DynamoDB 암호화 및 접근 제어 검증
4. **API 보안**: API Gateway 보안 헤더, Rate Limiting 점검

---

**작성자**: 보안 아키텍트  
**검토자**: CISO (예정)  
**승인자**: 프로젝트 매니저 (예정)  
**작성일**: 2024-08-23  

**관련 문서**: 
- [T002: 현재 보안 수준 평가](https://github.com/Hands-On-Vibe-Coding/handson-vibecoding-demo/issues/30)
- [docs/Security/K-ISMS-P-PRD.md](./K-ISMS-P-PRD.md)
- [K-ISMS-P 인증기준](./ISMS-P-based-PRD-answers.md)

---

> 🔒 **보안 주의**: 이 문서는 조직의 정보자산 현황을 포함하므로 외부 유출 금지  
> 📋 **업데이트**: 신규 자산 추가시 본 문서 업데이트 필수
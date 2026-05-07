# 뭐물꼬2 FE 진행 박제 (라이더 도메인)

> **이 repo (`momoolggo2-fe`)의 작업 영역 매트릭스**:
> - `views/rider/**`, 라이더 관련 라우트/스토어/서비스 → 본인 ✅
> - 그 외(auth/main/admin/customer/owner) 화면/스토어/서비스 → 팀원 ❌ (수정 금지, base 보존)
>
> **BE repo (`MOMOOLGGO_MSA`)와 짝**: BE rider-service 작업과 FE rider 화면 작업이 1:1 대응.

---

## 결정 매트릭스 (Phase 5 FE 진입)

| ID | 결정 | 사유 |
|---|---|---|
| Q-Scope | (다) 풀세트 — Figma 10장 전체 + STOMP 위치 시연 | 학원 발표 시각적 임팩트 |
| Q-FE-Repo | (a) 스냅샷 복사 — momoolggo-fe 전체를 momoolggo2-fe로 복사 (히스토리 0) | 본인 단독 진입, 새 GitHub repo |
| Q-FE-Timing | (ii) 각 R 백엔드 종결 후 해당 화면 FE 즉시 | 시연/검증 빠름 |
| Q-FE-Area | momoolggo2-fe 안에서 rider 부분만 본인 | BE rider + FE rider 단독 일관 |
| Q-FE-Flow | (a) 1차 패턴 + Figma 일관 — 가입 후 signin redirect (수동 로그인) | 1차 패턴(수동) + Figma "로그인" link 양쪽 일관 |
| Q-FE-Address | (가) 빈 문자열 `""` 전송 — BE는 setter 부재로 무시 | BE 변경 회피 (팀원 영역) |
| Q-FE-AccountNo | (i) 가입 시점 PUT profile 호출 안 함 | Figma 가입 화면에 계좌 부재 — 정산 화면(R7)에서 등록 |
| Q-Spec6 | (b) Figma 8장 추가 검토 — 170125 1번째 화면 = 라이더 로그인 식별 | 명세 인용 검증 일관 (R1-A 정정 패턴) |

---

## Phase 5-R1-FE 진행 박제 (라이더 가입 + 로그인 화면)

### Step 1: BE endpoint 사전 검증 (rider 영역만 코드 읽기)

| 검증 항목 | 결과 |
|---|---|
| `POST /api/user/join` address blank 허용 | ✅ — `UserSignupReq.address` String, 검증 0. `UserService.signup` line 52-60에서 User entity에 set 안 함 (BFF 패턴 — user_address는 별도 호출) |
| BE 자동 signin (BFF 패턴) | ⚠️ — `UserService.signup` line 64 `issueAndStoreTokens` 호출. 1차 customer FE는 응답 무시 + signin redirect 패턴. 라이더도 동일 패턴 일관 |
| `RiderProfileReq` accountNo nullable | ⚠️ — record 필드 null 허용이나 `RiderService.validate` line 99-105에서 6필드(licenseNo/licenseType/vehicleType/accountBank/accountNo/accountHolder) 모두 `requireNonBlank`. Q-FE-AccountNo (i) 채택으로 가입 시점 호출 X — 영향 0 |
| `signin` endpoint role 처리 | ✅ — `UserSigninReq`는 userId/userPw만. role 응답에서 받음. 1차 customer/owner 패턴 일관 |

### Step 1-bis: Figma 10장 매핑 정정 (4건, 5건 미만 — 진행 가능)

`docs/adr/rider/figma-analysis.md:195` 매핑 정정 사항:

| 파일명 | 박제 | 실제 (시각 검증) |
|---|---|---|
| 170116.png | ADR-001 회원가입/로그인 | **라이더 랜딩** ("배달 파트너 신청하기" 버튼) |
| 170121.png | (위와 묶음) | **라이더 회원가입** |
| 170125.png | ADR-004 상태 머신 (배차/픽업) | **라이더 로그인 + 배달대기 + 배달현황** (3장 묶음, 첫 번째가 로그인) |
| 170131.png | (위와 묶음) | 배달현황 (픽업대기중/픽업완료 모달) — ADR-004 OK |
| 170137.png | ADR-005 위치 추적 (지도) | 배달현황 (배달중 + 지도 + 픽업지) — ADR-005 OK |
| 170143.png | (위와 묶음) | 직접 전달 사유 모달 (고객 요청/고객 부재) — ADR-002 정정 10 |
| 170148.png | ADR-007 정산 | **배달완료 + 사진 + 배달내역** — ADR-002 정정 10 + ADR-006 (정산 X) |
| 170153.png | ADR-008 근무관리 + 토글 | 메인 + 토글 + 사이드 메뉴 (배달중/식사중) — ADR-008 OK |
| 170158.png | ADR-009 공지사항 + ADR-002 종합 | 공지사항 (중요/안전/일반) — ADR-009 OK |
| 170202.png | (위와 묶음) | **정산 + 근무관리** — ADR-007 + ADR-008 |

### Step 2~4: 화면 구현 (1차 customer 패턴 일관)

| 신규 파일 | 위치 | 패턴 | Figma 추종 |
|---|---|---|---|
| `RiderSignupView.vue` | `src/views/rider/` | CustomerSignupView | 170121.png — 주소/NaverMap 제거, 운전면허/배달수단 드롭다운 추가 |
| `RiderSigninView.vue` | `src/views/rider/` | CustomerSigninView | 170125.png 첫 번째 화면 — role 검증 'RIDER', redirect '/riderservice' |
| `riderService.js` | `src/services/` | userService | PUT /api/rider/profile + GET /api/rider/me 스켈레톤 (가입 시점 호출 X, 차후 마이페이지 진입 시 사용) |
| `riderStore.js` | `src/stores/` | userStore | profile state + loadProfile/setProfile/reset (차후 마이페이지 진입 시 사용) |

### Step 5: 라우터 갱신

`src/router/index.js`에 라이더 3건 추가 (다른 도메인 라우트 미변경):

```js
{ path: '/rider/signup', name: 'RiderSignup', component: RiderSignupView, meta: { guestOnly: true } }
{ path: '/rider/signin', name: 'RiderSignin', component: RiderSigninView, meta: { guestOnly: true } }
{ path: '/riderservice', name: 'RiderService', component: RiderHomeView, meta: { requiresAuth: true, role: 'RIDER' } }
```

라우터 가드는 이미 RIDER 분기 박제됨 (line 109/116/122) — 라우트만 추가.

### 가입 흐름 (1차 customer 패턴 일관)

```
1. POST /api/user/join (role=RIDER, address="")  // form 전체 전송, license/vehicle은 BE 무시
2. BE: 자동 AT/RT 발급 + UserSigninRes 반환 (BFF 패턴)
3. FE: 응답 무시
4. showAlert('회원가입이 완료되었습니다!')
5. router.push('/rider/signin')
   └─ 라우터 가드: guestOnly + isSignedIn=false (userStore.signIn 호출 안 함) → 로그인 화면 표시
6. 사용자가 직접 로그인 → userStore.signIn(data) → router.push('/riderservice')
```

### 통합 시연 (사용자 환경)

- **BE**: 5 서비스 기동 (auth:8081 / main:8080 / rider:8082 / admin:8083 / gateway:8000)
- **DB**: 학원 MySQL `112.222.157.157:5012` 연결 (my_mmg_auth + my_mmg_rider 스키마)
- **FE**: `npm install` + `npm run dev` (vite)
- **흐름**: `/rider/signup` 진입 → 가입 → `/rider/signin` redirect → 로그인 → `/riderservice` 메인 화면 (현재 RiderHomeView "준비 중" 빈 화면)

---

## 다음 단계

R2-a 백엔드 종결 (BE) 후 라이더 메인 화면 / 배달현황 / 마이페이지 등 진입 (Q-FE-Timing (ii)).

마이페이지 진입 시 PUT /api/rider/profile 호출 (license/vehicle/account 6필드 모두 입력 받음 — Figma 정산 화면 170202).

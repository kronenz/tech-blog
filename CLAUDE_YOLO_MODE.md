# Claude Code CLI YOLO Mode 활성화 가이드

## YOLO Mode란?

YOLO (You Only Live Once) Mode는 모든 권한 확인을 건너뛰고 명령을 자동으로 실행하는 모드입니다. 반복적인 작업을 빠르게 수행할 수 있지만, 보안 위험이 있으므로 주의가 필요합니다.

## 활성화 방법

### 방법 1: `--dangerously-skip-permissions` 플래그 사용 (권장)

```bash
claude --dangerously-skip-permissions
```

또는 짧은 명령어로:
```bash
claude -p --dangerously-skip-permissions "your prompt here"
```

### 방법 2: `--permission-mode bypassPermissions` 사용

```bash
claude --permission-mode bypassPermissions
```

또는:
```bash
claude --permission-mode bypassPermissions -p "your prompt here"
```

### 방법 3: 설정 파일에 영구적으로 추가

Claude Code CLI 설정 파일에 추가하여 기본값으로 설정할 수 있습니다:

```bash
# 설정 파일 위치 확인
claude --help | grep settings

# 또는 직접 설정 파일 편집
# ~/.claude/settings.json 또는 프로젝트별 설정 파일
```

## 사용 예시

### 기본 사용
```bash
# YOLO mode로 대화형 세션 시작
claude --dangerously-skip-permissions

# YOLO mode로 명령 실행 (비대화형)
claude --dangerously-skip-permissions -p "파일을 생성하고 수정해줘"
```

### Permission Mode 사용
```bash
# bypassPermissions 모드로 시작
claude --permission-mode bypassPermissions

# 다른 permission 모드 옵션들:
# - "acceptEdits": 편집 자동 승인
# - "bypassPermissions": 모든 권한 확인 건너뛰기 (YOLO)
# - "default": 기본 모드 (확인 요청)
# - "dontAsk": 묻지 않음
# - "plan": 계획 모드
```

## 주의사항

⚠️ **중요한 보안 경고:**

1. **신뢰할 수 있는 환경에서만 사용**
   - YOLO mode는 모든 안전 확인을 건너뛰므로 위험할 수 있습니다
   - 프로덕션 환경이나 중요한 프로젝트에서는 사용하지 마세요

2. **데이터 손실 위험**
   - 파일 삭제, 덮어쓰기 등이 확인 없이 실행될 수 있습니다
   - 중요한 작업 전에는 백업을 권장합니다

3. **권장 사용 환경**
   - 개발/테스트 환경
   - Docker 컨테이너 내부
   - 인터넷 접근이 제한된 샌드박스 환경

## YOLO Mode 비활성화

일반 모드로 돌아가려면:
```bash
# 플래그 없이 실행
claude

# 또는 명시적으로 default 모드 지정
claude --permission-mode default
```

## 다른 Permission Mode 옵션

```bash
# 편집 자동 승인 (YOLO보다 안전)
claude --permission-mode acceptEdits

# 계획만 세우고 실행하지 않음
claude --permission-mode plan

# 묻지 않음 (기본값과 유사)
claude --permission-mode dontAsk
```

## 실제 사용 예시

```bash
# YOLO mode로 여러 파일 생성
claude --dangerously-skip-permissions -p "src/components/Button.tsx, src/components/Input.tsx 파일을 생성해줘"

# YOLO mode로 코드 리팩토링
claude --dangerously-skip-permissions -p "모든 TypeScript 파일의 타입을 개선해줘"

# Permission mode로 자동 편집 승인
claude --permission-mode acceptEdits -p "코드 스타일을 Prettier로 포맷팅해줘"
```

## 문제 해결

### YOLO mode가 작동하지 않는 경우

1. **버전 확인**
   ```bash
   claude --version
   ```
   - 최신 버전인지 확인 (현재: 2.0.54)

2. **플래그 확인**
   ```bash
   claude --help | grep -i "permission\|skip"
   ```

3. **설정 파일 확인**
   - 프로젝트별 설정 파일이 있는지 확인
   - 전역 설정과 충돌하는지 확인

## 참고 자료

- Claude Code CLI 공식 문서
- `claude --help` 명령어로 최신 옵션 확인





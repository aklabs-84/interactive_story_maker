# 기술 요구사항 정의서 (TRD)

## 1. 시스템 아키텍처
본 어플리케이션은 별도의 서버 구축 없이 브라우저 환경에서 동작하는 **Serverless Web App** 구조를 가짐.

- **Frontend**: HTML5, CSS3 (Tailwind CSS), Vanilla JavaScript.
- **Backend (API)**: Google Apps Script (GAS).
- **Database/Storage**:
  - Local: Browser LocalStorage (스토리 메타데이터 및 설정 저장).
  - Cloud: Google Sheets (스토리 데이터 백업 및 공유용).
- **Libraries**:
  - `Tone.js`: 웹 오디오 엔진 (사운드 효과 재생).
  - `Tailwind CSS`: UI 스타일링 프레임워크.

## 2. 파일 구성 및 역할

### 2.1. HTML (View)
- `index.html`: 서비스 진입점, 주요 기능 카드 UI.
- `editor.html`: 스토리 작성 UI 및 트리 구조 편집 로직 연결.
- `player.html`: 스토리 재생 및 인터랙티브 UI.
- `manager.html`: 저장된 스토리 목록 관리 및 공유 기능.

### 2.2. JavaScript (Logic)
- `js/config.js`: 전역 설정 변수(API URL, 스토리지 키 등) 관리.
- `js/editor.js`: 스토리 트리 생성, 노드 관리, 시각화 로직.
- `js/player.js`: JSON 데이터를 해석하여 순차적으로 화면을 렌더링하는 시퀀서.
- `js/storage.js`: LocalStorage 읽기/쓰기 래퍼.
- `js/spreadsheet.js`: GAS API와의 통신(Fetch API) 처리.
- `js/json-converter.js`: 스토리 데이터 포맷 변환 유틸리티.
- `js/theme.js`, `js/sound.js`: 테마 전환 및 사운드 관리 모듈.

## 3. 데이터 구조 (Data Schema)

### 3.1. 스토리 JSON (Story JSON)
```json
{
  "nodes": [
    { "id": "S1", "title": "제목", "content": "내용", "image": "base64/url" }
  ],
  "links": [
    { "id": "L1", "source": "S1", "target": "S2", "label": "선택지 텍스트" }
  ]
}
```

## 4. 핵심 기술 사양
- **브라우저 호환성**: File API, Fetch API, LocalStorage를 지원하는 Modern 브라우저 (Chrome, Edge 등).
- **보안**: API 키 노출 방지를 위해 클라이언트 단에서의 접근 제한 필요 (현재는 교육용으로 GAS URL 직접 노출).
- **확장성**: JSON 기반 데이터 구조로 외부 스토리 가져오기/내보내기 용이.

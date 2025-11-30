// ==========================================
// 설정 파일 - 반드시 수정하세요!
// ==========================================

const CONFIG = {
  // Google Apps Script 웹앱 URL (배포 후 받은 URL 입력)
  GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyVo9ZfAkmqkg2uvca-WxknxWP0hAe8WlpSacoICEnRkX6bDPRYfWt-NoRSmxmgUMHpAw/exec',

  // 스프레드시트 웹앱 URL (GOOGLE_APPS_SCRIPT_URL과 동일)
  get SPREADSHEET_WEB_APP_URL() {
    return this.GOOGLE_APPS_SCRIPT_URL;
  },

  // 현재 웹앱이 호스팅된 기본 URL
  // GitHub Pages 예: 'https://username.github.io/story-maker'
  get WEB_APP_BASE_URL() {
    const path = window.location.pathname;
    const basePath = path.substring(0, path.lastIndexOf('/') + 1);
    return window.location.origin + basePath;
  }
};

// 로컬 스토리지 키
const STORAGE_KEYS = {
  STORIES: 'interactive_stories',
  THEME: 'currentTheme',
  SOUND: 'soundEnabled',
  MODE: 'displayMode' // 'light' 또는 'dark'
};

// ==========================================
// 디스플레이 모드 모듈 (라이트/다크)
// ==========================================
const ModeModule = {
  isDarkMode: true,

  init() {
    // 저장된 모드 불러오기
    const savedMode = localStorage.getItem(STORAGE_KEYS.MODE);
    
    if (savedMode === 'light') {
      this.isDarkMode = false;
      document.body.classList.add('light-mode');
    } else {
      this.isDarkMode = true;
      document.body.classList.remove('light-mode');
    }
    
    this.updateIcons();
  },

  toggle() {
    this.isDarkMode = !this.isDarkMode;
    
    if (this.isDarkMode) {
      document.body.classList.remove('light-mode');
      localStorage.setItem(STORAGE_KEYS.MODE, 'dark');
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem(STORAGE_KEYS.MODE, 'light');
    }
    
    this.updateIcons();
    
    // 토스트 메시지 (showToast 함수가 있을 경우)
    if (typeof showToast === 'function') {
      showToast(this.isDarkMode ? '🌙 다크 모드' : '☀️ 라이트 모드');
    }
  },

  updateIcons() {
    document.querySelectorAll('.mode-icon').forEach(icon => {
      icon.textContent = this.isDarkMode ? '🌙' : '☀️';
    });
  }
}; 
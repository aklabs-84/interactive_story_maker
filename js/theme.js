// ==========================================
// 테마 모듈
// ==========================================

const ThemeModule = {
  themes: {
    christmas: {
      name: '크리스마스',
      colors: {
        bg1: '#1a1f2e',
        bg2: '#1a1f2e',
        primary: '#e11d48',
        accent: '#22d3ee',
        textPrimary: '#f0f4f8',
        textSecondary: '#d1dae3',
        textMuted: '#8b9aad'
      },
      animation: 'snow'
    },
    space: {
      name: '우주',
      colors: {
        bg1: '#0f0820',
        bg2: '#0f0820',
        primary: '#8b5cf6',
        accent: '#fbbf24',
        textPrimary: '#e8e4f3',
        textSecondary: '#c4b9e0',
        textMuted: '#9080b8'
      },
      animation: 'stars'
    }
  },

  currentTheme: DEFAULT_THEME,

  applyTheme(themeName) {
    const theme = this.themes[themeName];
    if (!theme) return;

    const root = document.documentElement;
    root.style.setProperty('--bg1', theme.colors.bg1);
    root.style.setProperty('--bg2', theme.colors.bg2);
    root.style.setProperty('--primary', theme.colors.primary);
    root.style.setProperty('--accent', theme.colors.accent);

    // 텍스트 색상도 테마에 맞게 적용
    root.style.setProperty('--text-primary', theme.colors.textPrimary);
    root.style.setProperty('--text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--text-muted', theme.colors.textMuted);

    this.currentTheme = themeName;
    this.initAnimation(theme.animation);
    localStorage.setItem(STORAGE_KEYS.THEME, themeName);
  },

  initAnimation(animationType) {
    const layer = document.getElementById('animationLayer');
    if (!layer) return;

    // 이전 애니메이션 완전히 제거
    layer.innerHTML = '';
    layer.style.background = ''; // 배경도 초기화

    switch (animationType) {
      case 'snow': this.createSnow(layer); break;
      case 'stars': this.createStars(layer); break;
    }
  },

  createSnow(container) {
    for (let i = 0; i < 80; i++) {
      const span = document.createElement('span');
      const size = Math.random() * 4 + 1.5;
      const duration = Math.random() * 6 + 10; // 10~16s
      const delay = Math.random() * 6;
      const drift = Math.random() * 60 - 30;
      span.style.cssText = `
        position: absolute; top: -10px; left: ${Math.random() * 100}vw;
        width: ${size}px; height: ${size}px; background: rgba(255,255,255,0.9);
        border-radius: 50%; filter: drop-shadow(0 0 6px rgba(255,255,255,0.5));
        opacity: 0.85;
        animation: fall ${duration}s linear ${delay}s infinite, drift ${duration}s ease-in-out ${delay}s infinite;
        transform: translateX(0);
      `;
      container.appendChild(span);
    }
    this.addAnimationStyle('snowAnimation', `
      @keyframes fall { to { transform: translateY(110vh) rotate(360deg); } }
      @keyframes drift { 0% { transform: translateX(0); } 50% { transform: translateX(${drift}px); } 100% { transform: translateX(0); } }
    `);
  },

  createStars(container) {
    // 별 반짝임을 느리게, 부드럽게
    for (let i = 0; i < 120; i++) {
      const span = document.createElement('span');
      const size = Math.random() * 2 + 1;
      const duration = Math.random() * 6 + 6; // 6~12s
      const delay = Math.random() * 5;
      span.style.cssText = `
        position: absolute; top: ${Math.random() * 100}vh; left: ${Math.random() * 100}vw;
        width: ${size}px; height: ${size}px; background: white; border-radius: 50%;
        opacity: 0.2;
        animation: twinkle ${duration}s ease-in-out ${delay}s infinite;
        box-shadow: 0 0 ${Math.random() * 8 + 4}px rgba(255,255,255,0.4);
      `;
      container.appendChild(span);
    }
    this.addAnimationStyle('starsAnimation', '@keyframes twinkle { 0%, 100% { opacity: 0.15; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.4); } }');
  },

  addAnimationStyle(id, css) {
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = css;
      document.head.appendChild(style);
    }
  }
};

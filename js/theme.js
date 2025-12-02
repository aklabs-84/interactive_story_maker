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
    },
    fantasy: {
      name: '판타지',
      colors: {
        bg1: '#0d1f0d',
        bg2: '#0d1f0d',
        primary: '#10b981',
        accent: '#fbbf24',
        textPrimary: '#e8f5e8',
        textSecondary: '#c4e4c4',
        textMuted: '#8db88d'
      },
      animation: 'sparkles'
    },
    school: {
      name: '학교',
      colors: {
        bg1: '#1e293b',
        bg2: '#1e293b',
        primary: '#3b82f6',
        accent: '#fbbf24',
        textPrimary: '#f0f4f8',
        textSecondary: '#cbd5e1',
        textMuted: '#94a3b8'
      },
      animation: 'none'
    },
    summer: {
      name: '여름',
      colors: {
        bg1: '#0c3a5a',
        bg2: '#0c3a5a',
        primary: '#f97316',
        accent: '#fbbf24',
        textPrimary: '#f0f9ff',
        textSecondary: '#bae6fd',
        textMuted: '#7dd3fc'
      },
      animation: 'waves'
    },
    autumn: {
      name: '가을',
      colors: {
        bg1: '#3d1808',
        bg2: '#3d1808',
        primary: '#ea580c',
        accent: '#fbbf24',
        textPrimary: '#fef3e8',
        textSecondary: '#fed7aa',
        textMuted: '#fb923c'
      },
      animation: 'leaves'
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
      case 'sparkles': this.createSparkles(layer); break;
      case 'waves': this.createWaves(layer); break;
      case 'leaves': this.createLeaves(layer); break;
    }
  },

  createSnow(container) {
    for (let i = 0; i < 60; i++) {
      const span = document.createElement('span');
      const size = Math.random() * 5 + 2;
      span.style.cssText = `
        position: absolute; top: -10px; left: ${Math.random() * 100}vw;
        width: ${size}px; height: ${size}px; background: rgba(255,255,255,0.9);
        border-radius: 50%; filter: drop-shadow(0 0 6px rgba(255,255,255,0.6));
        animation: fall ${Math.random() * 8 + 8}s linear ${Math.random() * 6}s infinite;
      `;
      container.appendChild(span);
    }
    this.addAnimationStyle('snowAnimation', '@keyframes fall { to { transform: translateY(110vh) rotate(360deg); } }');
  },

  createStars(container) {
    for (let i = 0; i < 100; i++) {
      const span = document.createElement('span');
      const size = Math.random() * 3 + 1;
      span.style.cssText = `
        position: absolute; top: ${Math.random() * 100}vh; left: ${Math.random() * 100}vw;
        width: ${size}px; height: ${size}px; background: white; border-radius: 50%;
        animation: twinkle ${Math.random() * 3 + 2}s ease-in-out ${Math.random() * 3}s infinite;
      `;
      container.appendChild(span);
    }
    this.addAnimationStyle('starsAnimation', '@keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }');
  },

  createSparkles(container) {
    for (let i = 0; i < 40; i++) {
      const span = document.createElement('span');
      const size = Math.random() * 4 + 2;
      span.style.cssText = `
        position: absolute; top: ${Math.random() * 100}vh; left: ${Math.random() * 100}vw;
        width: ${size}px; height: ${size}px; background: rgba(251, 191, 36, 0.8);
        border-radius: 50%; box-shadow: 0 0 10px rgba(251, 191, 36, 0.6);
        animation: sparkle ${Math.random() * 2 + 1}s ease-in-out ${Math.random() * 2}s infinite;
      `;
      container.appendChild(span);
    }
    this.addAnimationStyle('sparklesAnimation', '@keyframes sparkle { 0%, 100% { opacity: 0; transform: scale(0); } 50% { opacity: 1; transform: scale(1); } }');
  },

  createWaves(container) {
    // 배경 그라디언트 제거 - 너무 눈에 띔
    // container.style.background = 'linear-gradient(180deg, transparent 0%, rgba(34, 211, 238, 0.05) 100%)';

    // 대신 미묘한 물결 애니메이션 추가
    for (let i = 0; i < 3; i++) {
      const wave = document.createElement('div');
      wave.style.cssText = `
        position: absolute; bottom: 0; left: 0; width: 200%; height: 100px;
        background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.03), transparent);
        animation: wave ${6 + i * 2}s linear ${i * 2}s infinite;
      `;
      container.appendChild(wave);
    }
    this.addAnimationStyle('wavesAnimation', '@keyframes wave { 0% { transform: translateX(-50%); } 100% { transform: translateX(0%); } }');
  },

  createLeaves(container) {
    for (let i = 0; i < 30; i++) {
      const span = document.createElement('span');
      span.textContent = '🍂';
      span.style.cssText = `
        position: absolute; top: -20px; left: ${Math.random() * 100}vw;
        font-size: ${Math.random() * 8 + 4}px;
        animation: fallLeaf ${Math.random() * 10 + 10}s linear ${Math.random() * 5}s infinite;
      `;
      container.appendChild(span);
    }
    this.addAnimationStyle('leavesAnimation', '@keyframes fallLeaf { to { transform: translateY(110vh) rotate(720deg) translateX(100px); } }');
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

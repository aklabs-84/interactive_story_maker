// ==========================================
// 테마 모듈
// ==========================================

const ThemeModule = {
  themes: {
    christmas: {
      name: '크리스마스',
      colors: { bg1: '#0b1220', bg2: '#0f1c34', primary: '#e11d48', accent: '#22d3ee' },
      animation: 'snow'
    },
    space: {
      name: '우주',
      colors: { bg1: '#0a0515', bg2: '#1a0f2e', primary: '#8b5cf6', accent: '#fbbf24' },
      animation: 'stars'
    },
    fantasy: {
      name: '판타지',
      colors: { bg1: '#0f1a0f', bg2: '#1a2f1a', primary: '#10b981', accent: '#fbbf24' },
      animation: 'sparkles'
    },
    school: {
      name: '학교',
      colors: { bg1: '#1e293b', bg2: '#334155', primary: '#3b82f6', accent: '#fbbf24' },
      animation: 'none'
    },
    summer: {
      name: '여름',
      colors: { bg1: '#0c4a6e', bg2: '#0e7490', primary: '#f97316', accent: '#fbbf24' },
      animation: 'waves'
    },
    autumn: {
      name: '가을',
      colors: { bg1: '#431407', bg2: '#7c2d12', primary: '#ea580c', accent: '#fbbf24' },
      animation: 'leaves'
    }
  },

  currentTheme: 'christmas',

  applyTheme(themeName) {
    const theme = this.themes[themeName];
    if (!theme) return;

    const root = document.documentElement;
    root.style.setProperty('--bg1', theme.colors.bg1);
    root.style.setProperty('--bg2', theme.colors.bg2);
    root.style.setProperty('--primary', theme.colors.primary);
    root.style.setProperty('--accent', theme.colors.accent);

    this.currentTheme = themeName;
    this.initAnimation(theme.animation);
    localStorage.setItem(STORAGE_KEYS.THEME, themeName);
  },

  initAnimation(animationType) {
    const layer = document.getElementById('animationLayer');
    if (!layer) return;
    
    layer.innerHTML = '';

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
    container.style.background = 'linear-gradient(180deg, transparent 0%, rgba(34, 211, 238, 0.05) 100%)';
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
// ==========================================
// 플레이어 페이지 스크립트
// ==========================================

const PlayerState = {
  currentStory: null,
  playerHistory: [],
  currentNodeId: null,
  isSharedMode: false,
  typewriterTimeout: null
};

const PlayerModule = {
  startStory(story) {
    PlayerState.currentStory = story;
    PlayerState.playerHistory = [];
    PlayerState.currentNodeId = story.startNodeId;
    
    // 테마 적용
    if (story.metadata.theme) {
      ThemeModule.applyTheme(story.metadata.theme);
      document.getElementById('themeSelector').value = story.metadata.theme;
    }
    
    // 페이지 타이틀 업데이트
    document.getElementById('pageTitle').textContent = story.metadata.title;
    document.getElementById('pageSubtitle').textContent = `by ${story.metadata.author || '익명'}`;
    document.title = `▶️ ${story.metadata.title} - 인터랙티브 스토리`;
    
    this.renderNode(story.startNodeId);
  },

  renderNode(nodeId) {
    const story = PlayerState.currentStory;
    if (!story || !story.nodes[nodeId]) {
      console.error('Node not found:', nodeId);
      return;
    }
    
    const node = story.nodes[nodeId];
    PlayerState.currentNodeId = nodeId;
    
    const container = document.getElementById('playerContent');
    
    if (node.type === 'ending') {
      this.renderEnding(node, container);
    } else {
      this.renderStoryNode(node, container);
    }
  },

  renderStoryNode(node, container) {
    console.log('렌더링 중인 노드:', node);
    console.log('이미지 URL:', node.image);

    container.innerHTML = `
      <div class="story-player fade-in">
        ${this.renderHistory()}

        <div class="current-story mb-8">
          ${node.image ? `
            <div class="story-image mb-6">
              <img src="${node.image}" alt="스토리 이미지" class="w-full rounded-xl shadow-lg" style="max-width: 500px; margin: 0 auto; display: block;" onerror="console.error('이미지 로드 실패:', this.src); this.style.display='none'">
            </div>
          ` : '<p class="text-xs text-slate-500 mb-4">🖼️ 이미지 없음</p>'}
          <div class="flex items-start gap-4 mb-6">
            <div class="text-4xl">${node.emoji || '📖'}</div>
            <div class="flex-1">
              <p class="story-text text-lg leading-relaxed" id="storyText"></p>
            </div>
          </div>
        </div>
        
        <div class="choices-container" id="choicesContainer">
          ${node.choices?.length > 0 ? `
            <h4 class="text-sm font-medium text-slate-400 mb-4">어떤 선택을 하시겠습니까?</h4>
            <div class="grid gap-3">
              ${node.choices.map((choice, index) => `
                <button class="choice-btn p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-cyan-400 transition-all text-left flex items-center gap-3 group" data-next-id="${choice.nextId}" data-index="${index}">
                  <span class="text-2xl group-hover:scale-110 transition-transform">${choice.emoji || '➡️'}</span>
                  <span class="flex-1">${choice.label}</span>
                  <span class="text-slate-500 group-hover:text-cyan-400 transition-colors">→</span>
                </button>
              `).join('')}
            </div>
          ` : '<div class="text-center py-4 text-slate-400">선택지가 없습니다</div>'}
        </div>
        
        <div class="controls mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-3">
          ${PlayerState.playerHistory.length > 0 ? `
            <button id="backBtn" class="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition flex items-center gap-2">
              <span>⬅️</span><span>이전으로</span>
            </button>
          ` : ''}
          <button id="restartBtn" class="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition flex items-center gap-2">
            <span>🔄</span><span>처음부터</span>
          </button>
        </div>
      </div>
    `;
    
    this.typeText(node.text, document.getElementById('storyText'));
    this.attachEventListeners();
  },

  renderEnding(node, container) {
    console.log('엔딩 노드:', node);
    console.log('엔딩 이미지 URL:', node.image);
    console.log('엔딩 전용 이미지 URL:', node.ending?.image);

    const colors = {
      happy: 'from-green-500/20 to-emerald-500/20 border-green-500/50',
      sad: 'from-blue-500/20 to-indigo-500/20 border-blue-500/50',
      neutral: 'from-purple-500/20 to-violet-500/20 border-purple-500/50'
    };
    const emojis = { happy: '🎉', sad: '😢', neutral: '🏁' };

    const colorClass = colors[node.ending?.type] || colors.neutral;
    const endingEmoji = emojis[node.ending?.type] || '🏁';

    SoundModule.playEnding(node.ending?.type || 'neutral');

    container.innerHTML = `
      <div class="ending-screen fade-in">
        ${this.renderHistory()}

        ${node.image ? `
          <div class="story-image mb-6">
            <img src="${node.image}" alt="스토리 이미지" class="w-full rounded-xl shadow-lg" style="max-width: 500px; margin: 0 auto; display: block;" onerror="console.error('스토리 이미지 로드 실패:', this.src); this.style.display='none'">
          </div>
        ` : ''}

        <div class="mb-8 p-6 bg-white/5 rounded-lg">
          <div class="flex items-start gap-4">
            <div class="text-4xl">${node.emoji || '📖'}</div>
            <p class="text-lg leading-relaxed">${node.text}</p>
          </div>
        </div>

        <div class="ending-card p-8 bg-gradient-to-br ${colorClass} rounded-xl border text-center">
          ${node.ending?.image ? `
            <div class="ending-image mb-6">
              <img src="${node.ending.image}" alt="엔딩 이미지" class="w-full rounded-xl shadow-lg" style="max-width: 400px; margin: 0 auto; display: block;" onerror="console.error('엔딩 이미지 로드 실패:', this.src); this.style.display='none'">
            </div>
          ` : ''}
          <div class="text-6xl mb-4">${endingEmoji}</div>
          <h2 class="text-2xl font-bold mb-2">${node.ending?.title || '엔딩'}</h2>
          ${node.ending?.message ? `<p class="text-slate-300">${node.ending.message}</p>` : ''}
        </div>
        
        <div class="controls mt-8 flex flex-wrap justify-center gap-3">
          <button id="restartBtn" class="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-medium transition flex items-center gap-2">
            <span>🔄</span><span>다시 시작</span>
          </button>
          ${PlayerState.playerHistory.length > 0 ? `
            <button id="backBtn" class="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition flex items-center gap-2">
              <span>⬅️</span><span>다른 선택하기</span>
            </button>
          ` : ''}
        </div>
      </div>
    `;
    
    this.attachEventListeners();
  },

  renderHistory() {
    if (PlayerState.playerHistory.length === 0) return '';
    
    return `
      <div class="history mb-6 p-4 bg-white/5 rounded-lg">
        <h4 class="text-sm font-medium text-slate-400 mb-2">📜 지금까지의 선택</h4>
        <div class="flex flex-wrap gap-2">
          ${PlayerState.playerHistory.map(item => `
            <span class="px-3 py-1 bg-white/10 rounded-full text-sm flex items-center gap-1">
              <span>${item.emoji || '➡️'}</span>
              <span>${item.label}</span>
            </span>
          `).join('')}
        </div>
      </div>
    `;
  },

  typeText(text, element, speed = 30) {
    if (PlayerState.typewriterTimeout) {
      clearTimeout(PlayerState.typewriterTimeout);
    }
    
    element.textContent = '';
    let index = 0;
    
    const type = () => {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        if (index % 3 === 0) SoundModule.playTyping();
        PlayerState.typewriterTimeout = setTimeout(type, speed);
      }
    };
    
    type();
  },

  attachEventListeners() {
    // 선택지 버튼
    document.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        SoundModule.playButtonClick();
        
        const nextId = btn.dataset.nextId;
        const label = btn.querySelector('span:nth-child(2)').textContent;
        const emoji = btn.querySelector('span:first-child').textContent;
        
        PlayerState.playerHistory.push({
          nodeId: PlayerState.currentNodeId,
          label, emoji, nextId
        });
        
        this.renderNode(nextId);
      });
    });
    
    // 이전 버튼
    document.getElementById('backBtn')?.addEventListener('click', () => {
      SoundModule.playButtonClick();
      if (PlayerState.playerHistory.length > 0) {
        const lastChoice = PlayerState.playerHistory.pop();
        this.renderNode(lastChoice.nodeId);
      }
    });
    
    // 처음부터 버튼
    document.getElementById('restartBtn')?.addEventListener('click', () => {
      SoundModule.playButtonClick();
      PlayerState.playerHistory = [];
      this.renderNode(PlayerState.currentStory.startNodeId);
    });
  },

  showEmptyState() {
    document.getElementById('playerContent').innerHTML = `
      <div class="text-center py-12 text-slate-400">
        <div class="text-6xl mb-4">🎮</div>
        <p class="text-lg mb-4">체험할 스토리가 없습니다</p>
        <p class="text-sm mb-6">스토리를 만들거나 불러온 후 체험해보세요!</p>
        ${!PlayerState.isSharedMode ? `
          <div class="flex flex-wrap justify-center gap-3">
            <a href="editor.html" class="create-story-btn px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium transition">✏️ 스토리 만들기</a>
            <a href="manager.html" class="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition">💾 내 스토리</a>
          </div>
        ` : ''}
      </div>
    `;
  },

  showError(message = '스토리를 불러올 수 없습니다') {
    document.getElementById('playerContent').innerHTML = `
      <div class="text-center py-12 text-slate-400">
        <div class="text-6xl mb-4">😢</div>
        <p class="text-lg mb-4">${message}</p>
        <p class="text-sm mb-6">링크가 잘못되었거나 스토리가 삭제되었을 수 있습니다.</p>
        <a href="index.html" class="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-medium transition inline-block">🏠 홈으로</a>
      </div>
    `;
  }
};

// ==========================================
// 페이지 초기화
// ==========================================
async function initPlayerPage() {
  // 모드 초기화 (라이트/다크)
  ModeModule.init();

  // 테마 & 사운드 초기화
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'christmas';
  document.getElementById('themeSelector').value = savedTheme;
  ThemeModule.applyTheme(savedTheme);
  SoundModule.init();
  SoundModule.updateIcons();

  // 테마 선택
  document.getElementById('themeSelector').addEventListener('change', (e) => {
    ThemeModule.applyTheme(e.target.value);
    SoundModule.playButtonClick();
  });

  // 모드 토글
  document.getElementById('modeToggle').addEventListener('click', () => {
    ModeModule.toggle();
    SoundModule.playButtonClick();
  });

  // 사운드 토글
  document.getElementById('soundToggle').addEventListener('click', () => {
    SoundModule.toggle();
  });

  // URL 파라미터 확인
  const storyId = getUrlParam('story');
  const isTemp = getUrlParam('temp') === 'true';

  if (isTemp) {
    // 임시 저장된 스토리 (에디터에서 체험하기)
    const tempData = localStorage.getItem('tempPlayStory');
    if (tempData) {
      const story = JSON.parse(tempData);
      localStorage.removeItem('tempPlayStory');
      PlayerModule.startStory(story);
    } else {
      PlayerModule.showEmptyState();
    }
  } else if (storyId) {
    // 공유 링크로 접속 - 스프레드시트에서 불러오기
    PlayerState.isSharedMode = true;
    document.body.classList.add('shared-mode');
    
    // 먼저 로컬에서 찾기
    let story = StorageModule.getStory(storyId);
    
    if (!story) {
      // 로컬에 없으면 스프레드시트에서 불러오기
      story = await SpreadsheetModule.loadStory(storyId);
    }
    
    if (story) {
      PlayerModule.startStory(story);
      showToast(`📖 "${story.metadata.title}" 스토리를 시작합니다!`);
    } else {
      PlayerModule.showError('스토리를 찾을 수 없습니다');
    }
  } else {
    // 파라미터 없이 접속 - 최신 로컬 스토리 또는 빈 상태
    const latestStory = StorageModule.getLatestStory();
    if (latestStory) {
      PlayerModule.startStory(latestStory);
    } else {
      PlayerModule.showEmptyState();
    }
  }
}

// 페이지 로드
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlayerPage);
} else {
  initPlayerPage();
}
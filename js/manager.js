// ==========================================
// 매니저 페이지 스크립트
// ==========================================

const ManagerModule = {
  draggedItem: null,

  renderStoriesList() {
    const container = document.getElementById('savedStoriesList');
    const { id: currentUserId, name: currentUserName } = UserModule.ensureProfile();
    const allStories = StorageModule.getAllStories();

    // ownerId가 없는 기존 스토리는 현재 사용자 소유로 귀속
    let normalizedStories = allStories.map(story => {
      if (story?.metadata && !story.metadata.ownerId) {
        return {
          ...story,
          metadata: { ...story.metadata, ownerId: currentUserId }
        };
      }
      return story;
    });

    // 변경사항이 있으면 저장
    const needsSave = normalizedStories.some((story, idx) => story !== allStories[idx]);
    if (needsSave) {
      StorageModule.saveStoriesOrder(normalizedStories);
    }

    // 현재 사용자 스토리만 필터
    normalizedStories = normalizedStories.filter(story => story?.metadata?.ownerId === currentUserId);

    // 중복 제거: ID를 기준으로 유니크한 스토리만 표시 (최신 것만 유지)
    const uniqueStoriesMap = new Map();
    normalizedStories.forEach(story => {
      if (!uniqueStoriesMap.has(story.id)) {
        uniqueStoriesMap.set(story.id, story);
      }
    });
    const stories = Array.from(uniqueStoriesMap.values());

    if (stories.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-slate-400">
          <div class="text-6xl mb-4">📭</div>
          <p class="text-lg mb-2">${currentUserName}님의 스토리가 없습니다</p>
          <p class="text-sm mb-6">스토리를 만들고 저장해보세요!</p>
          <a href="editor.html" class="create-story-btn px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium transition inline-block">✏️ 스토리 만들기</a>
        </div>
      `;
      return;
    }
    
    container.innerHTML = `
      <div class="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <p class="text-xs text-slate-400">💡 드래그하여 순서를 변경할 수 있습니다. 맨 위가 최신 스토리입니다.</p>
        <span class="px-2 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] text-slate-300">🔒 ${currentUserName}님의 스토리만 표시 중</span>
      </div>
      ${stories.map((story, index) => `
        <div class="story-item p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition" 
             data-story-id="${story.id}" 
             data-index="${index}"
             draggable="true">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="drag-handle text-slate-500 hover:text-slate-300 flex-shrink-0 cursor-grab">
                <span class="text-lg">⋮⋮</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  ${index === 0 ? '<span class="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-xs rounded-full">최신</span>' : ''}
                  <h4 class="font-semibold text-lg truncate">${story.metadata.title}</h4>
                </div>
                <p class="text-sm text-slate-400 truncate">${story.metadata.description || '설명 없음'}</p>
                <div class="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
                  <span>📅 ${new Date(story.metadata.createdAt).toLocaleDateString('ko-KR')}</span>
                  <span>✍️ ${story.metadata.author || '익명'}</span>
                  <span>🎨 ${ThemeModule.themes[story.metadata.theme]?.name || '기본'}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0 flex-wrap">
              <button class="download-btn px-3 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-medium transition" data-story-id="${story.id}" title="JSON 다운로드">
                💾
              </button>
              <button class="share-btn px-3 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-medium transition" data-story-id="${story.id}" title="공유하기">
                🔗
              </button>
              <button class="edit-btn px-3 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-sm font-medium transition" data-story-id="${story.id}" title="수정하기">
                ✏️
              </button>
              <button class="play-btn px-3 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm font-medium transition" data-story-id="${story.id}" title="체험하기">
                ▶️
              </button>
              <button class="delete-btn px-3 py-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-sm font-medium border border-red-500/50 transition" data-story-id="${story.id}" title="삭제하기">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `).join('')}
    `;
    
    this.attachEventListeners(container);
    this.attachDragAndDrop(container);
  },

  attachEventListeners(container) {
    // 다운로드 버튼
    container.querySelectorAll('.download-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        SoundModule.playButtonClick();
        this.downloadStoryJson(btn.dataset.storyId);
      });
    });

    // 공유 버튼
    container.querySelectorAll('.share-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        SoundModule.playButtonClick();
        const story = StorageModule.getStory(btn.dataset.storyId);
        if (story) this.showShareModal(story);
      });
    });

    // 수정 버튼
    container.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        SoundModule.playButtonClick();
        window.location.href = `editor.html?edit=${btn.dataset.storyId}`;
      });
    });

    // 체험 버튼
    container.querySelectorAll('.play-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        SoundModule.playButtonClick();
        window.location.href = `player.html?story=${btn.dataset.storyId}`;
      });
    });

    // 삭제 버튼
    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('정말로 이 스토리를 삭제하시겠습니까?')) {
          SoundModule.playButtonClick();
          StorageModule.deleteStory(btn.dataset.storyId);
          this.renderStoriesList();
          showToast('🗑️ 스토리가 삭제되었습니다');
        }
      });
    });
  },

  attachDragAndDrop(container) {
    const items = container.querySelectorAll('.story-item');
    
    items.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        this.draggedItem = item;
        item.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
      });
      
      item.addEventListener('dragend', () => {
        this.draggedItem.style.opacity = '1';
        this.draggedItem = null;
        items.forEach(i => {
          i.style.borderTop = '';
          i.style.borderBottom = '';
        });
      });
      
      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (this.draggedItem && this.draggedItem !== item) {
          const rect = item.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          items.forEach(i => { i.style.borderTop = ''; i.style.borderBottom = ''; });
          
          if (e.clientY < midY) {
            item.style.borderTop = '3px solid #22d3ee';
          } else {
            item.style.borderBottom = '3px solid #22d3ee';
          }
        }
      });
      
      item.addEventListener('dragleave', () => {
        item.style.borderTop = '';
        item.style.borderBottom = '';
      });
      
      item.addEventListener('drop', (e) => {
        e.preventDefault();
        if (this.draggedItem && this.draggedItem !== item) {
          const fromIndex = parseInt(this.draggedItem.dataset.index);
          let toIndex = parseInt(item.dataset.index);
          
          const rect = item.getBoundingClientRect();
          if (e.clientY > rect.top + rect.height / 2 && fromIndex < toIndex) {
            // do nothing
          } else if (e.clientY > rect.top + rect.height / 2) {
            toIndex = Math.min(toIndex + 1, StorageModule.getAllStories().length - 1);
          }
          
          StorageModule.reorderStory(fromIndex, toIndex);
          this.renderStoriesList();
          SoundModule.playButtonClick();
          showToast('📋 스토리 순서가 변경되었습니다');
        }
        item.style.borderTop = '';
        item.style.borderBottom = '';
      });
    });
  },

  downloadStoryJson(storyId) {
    const story = StorageModule.getStory(storyId);
    if (!story) {
      showToast('❌ 스토리를 찾을 수 없습니다', 'error');
      return;
    }

    // JSON 문자열 생성 (들여쓰기 포함)
    const jsonString = JSON.stringify(story, null, 2);

    // Blob 생성
    const blob = new Blob([jsonString], { type: 'application/json' });

    // 다운로드 링크 생성
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // 파일명: 제목 + 날짜
    const safeTitle = story.metadata.title.replace(/[^a-zA-Z0-9가-힣\s]/g, '').replace(/\s+/g, '_');
    const timestamp = new Date().toISOString().split('T')[0];
    a.download = `${safeTitle}_${timestamp}.json`;

    // 다운로드 실행
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('✅ JSON 파일이 다운로드되었습니다', 'success');
  },

  showShareModal(story) {
    const modal = document.getElementById('shareModal');
    const urlInput = document.getElementById('shareUrlInput');
    const titleEl = document.getElementById('shareStoryTitle');

    titleEl.textContent = `📖 "${story.metadata.title}"`;
    urlInput.value = generateShareUrl(story.id);

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  hideShareModal() {
    const modal = document.getElementById('shareModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  },

  async shareLatestFromSpreadsheet() {
    // 로컬에 저장된 스토리 목록 가져오기 (내 스토리만)
    const currentUserId = UserModule.ensureProfile().id;
    const stories = StorageModule.getAllStories().filter(story => story?.metadata?.ownerId === currentUserId);

    if (stories.length === 0) {
      showToast('❌ 저장된 스토리가 없습니다', 'error');
      return;
    }

    // 첫 번째 스토리가 가장 최신 (renderStoriesList에서 정렬됨)
    const latestStory = stories[0];
    this.showShareModal(latestStory);
  }
};

// ==========================================
// 페이지 초기화
// ==========================================
function initManagerPage() {
  // 중복 스토리 제거 (페이지 로드 시 자동 정리)
  const removedCount = StorageModule.removeDuplicates();
  if (removedCount > 0) {
    console.log(`✅ 중복된 스토리 ${removedCount}개가 자동으로 제거되었습니다.`);
  }

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

  // 스토리 목록 렌더링
  ManagerModule.renderStoriesList();

  // 최신 스토리 공유 버튼 (스프레드시트에서 불러오기)
  document.getElementById('shareLatestBtn').addEventListener('click', () => {
    SoundModule.playButtonClick();
    ManagerModule.shareLatestFromSpreadsheet();
  });

  // 공유 모달 닫기
  document.getElementById('closeShareModal').addEventListener('click', () => {
    ManagerModule.hideShareModal();
  });

  // URL 복사
  document.getElementById('copyShareUrl').addEventListener('click', async () => {
    const url = document.getElementById('shareUrlInput').value;
    await copyToClipboard(url);
    showToast('✅ 링크가 복사되었습니다!', 'success');
  });

  // 모달 외부 클릭 닫기
  document.getElementById('shareModal').addEventListener('click', (e) => {
    if (e.target.id === 'shareModal') {
      ManagerModule.hideShareModal();
    }
  });

  // JSON 파일 업로드
  document.getElementById('uploadJsonBtn').addEventListener('click', () => {
    const fileInput = document.getElementById('jsonFileInput');
    const file = fileInput.files[0];

    if (!file) {
      showToast('⚠️ JSON 파일을 선택해주세요', 'error');
      return;
    }

    if (!file.name.endsWith('.json')) {
      showToast('❌ JSON 파일만 업로드 가능합니다', 'error');
      return;
    }

    SoundModule.playButtonClick();
    showLoading('JSON 파일을 읽는 중...');

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const jsonContent = e.target.result;
        const story = JSON.parse(jsonContent);
        const currentUser = UserModule.ensureProfile();

        // 기본 구조 검증
        if (!story.id || !story.metadata || !story.nodes) {
          hideLoading();
          showToast('❌ 올바르지 않은 스토리 형식입니다', 'error');
          return;
        }

        // 필수 메타데이터 검증
        if (!story.metadata.title) {
          hideLoading();
          showToast('❌ 스토리 제목이 없습니다', 'error');
          return;
        }

        // 소유자 검증/보정
        if (!story.metadata.ownerId) {
          story.metadata.ownerId = currentUser.id;
          showToast('ℹ️ 소유자 정보가 없어 내 계정으로 지정했습니다.', 'info');
        } else if (story.metadata.ownerId !== currentUser.id) {
          const confirmTakeOver = confirm('이 JSON은 다른 사용자 소유로 표시되어 있습니다. 내 스토리로 가져올까요?');
          if (!confirmTakeOver) {
            hideLoading();
            showToast('🚫 가져오기를 취소했습니다.', 'error');
            return;
          }
          story.metadata.ownerId = currentUser.id;
        }

        // localStorage에 저장
        StorageModule.saveStory(story);

        hideLoading();
        showToast('✅ 스토리가 성공적으로 불러와졌습니다!', 'success');

        // 파일 입력 초기화
        fileInput.value = '';

        // 스토리 목록 새로고침
        ManagerModule.renderStoriesList();

      } catch (err) {
        hideLoading();
        console.error('JSON 파싱 오류:', err);
        showToast('❌ JSON 파일 읽기 실패: ' + err.message, 'error');
      }
    };

    reader.onerror = () => {
      hideLoading();
      showToast('❌ 파일 읽기 실패', 'error');
    };

    reader.readAsText(file);
  });
}

// 페이지 로드
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initManagerPage);
} else {
  initManagerPage();
}

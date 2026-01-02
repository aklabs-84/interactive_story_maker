// ==========================================
// 에디터 페이지 스크립트 - 트리 구조 방식
// ==========================================

const EditorModule = {
  choiceCounter: 0,
  editingStoryId: null, // 편집 중인 스토리 ID 저장
  currentEditingNode: null, // 현재 편집 중인 노드
  compactMode: true, // 컴팩트 모드 활성화

  getNodeId(choiceEl) {
    return choiceEl.id;
  },

  // 형제 노드 접기 (같은 부모의 다른 자식들)
  collapseSiblings(choiceDiv) {
    const parentId = choiceDiv.dataset.parentId;
    if (!parentId) return;

    // 같은 부모를 가진 모든 형제 노드 찾기
    const siblings = document.querySelectorAll(`.choice-node[data-parent-id="${parentId}"]`);

    siblings.forEach(sibling => {
      if (sibling !== choiceDiv) {
        // 형제 노드 접기
        sibling.classList.add('collapsed');
        const icon = sibling.querySelector('.collapse-icon');
        const btn = sibling.querySelector('.collapse-toggle-btn');
        if (icon) icon.textContent = '▶';
        if (btn) btn.classList.add('collapsed');
      }
    });
  },

  // 모든 선택지 펼치기/접기
  toggleAllChoices(expand) {
    const allChoices = document.querySelectorAll('.choice-node');

    allChoices.forEach(choice => {
      const icon = choice.querySelector('.collapse-icon');
      const btn = choice.querySelector('.collapse-toggle-btn');

      if (expand) {
        // 펼치기
        choice.classList.remove('collapsed');
        if (icon) icon.textContent = '▼';
        if (btn) btn.classList.remove('collapsed');
      } else {
        // 접기
        choice.classList.add('collapsed');
        if (icon) icon.textContent = '▶';
        if (btn) btn.classList.add('collapsed');
      }
    });
  },

  // 경로 표시 생성 (예: 시작 → A → B)
  generateBreadcrumb(parentId, currentLetter) {
    const path = ['시작'];

    // 부모 노드를 따라 올라가며 경로 구성
    let current = parentId;
    const letters = [];

    while (current && current !== 'root') {
      const parentEl = document.getElementById(current);
      if (parentEl) {
        const letter = parentEl.dataset.letter?.toUpperCase() || '';
        if (letter) {
          letters.unshift(letter);
        }
        current = parentEl.dataset.parentId;
      } else {
        break;
      }
    }

    // 경로에 문자들 추가
    letters.forEach(letter => path.push(letter));
    path.push(currentLetter);

    // HTML 생성
    const breadcrumbItems = path.map((item, index) => {
      const isLast = index === path.length - 1;
      return `
        <span class="choice-breadcrumb-item">
          <span>${item}</span>
        </span>
        ${!isLast ? '<span class="choice-breadcrumb-separator">→</span>' : ''}
      `;
    }).join('');

    return `
      <div class="choice-breadcrumb">
        ${breadcrumbItems}
      </div>
    `;
  },

  addRootChoices() {
    const container = document.getElementById('choiceGroupsContainer');
    container.innerHTML = '';

    if (this.compactMode) {
      // 컴팩트 모드: 간단한 버튼형 트리 뷰
      const wrapper = document.createElement('div');
      wrapper.className = 'choice-tree-level root';
      wrapper.id = 'tree-root';

      const choiceA = this.createCompactChoice('root', 'a', 0);
      const choiceB = this.createCompactChoice('root', 'b', 0);

      wrapper.appendChild(choiceA);
      wrapper.appendChild(choiceB);

      container.appendChild(wrapper);
    } else {
      // 기존 확장 모드
      const wrapper = document.createElement('div');
      wrapper.className = 'space-y-4';

      const choiceA = this.createChoice('root', 'a', 0);
      const choiceB = this.createChoice('root', 'b', 0);

      wrapper.appendChild(choiceA);
      wrapper.appendChild(choiceB);

      container.appendChild(wrapper);
    }
  },

  // 컴팩트 선택지 생성 (간단한 버튼형)
  createCompactChoice(parentId, letter, level) {
    const choiceId = `choice-${Date.now()}-${this.choiceCounter++}-${letter}`;

    const container = document.createElement('div');
    container.className = 'choice-tree-container';

    const choiceBtn = document.createElement('button');
    choiceBtn.id = choiceId;
    choiceBtn.className = 'choice-tree-item';
    choiceBtn.dataset.parentId = parentId;
    choiceBtn.dataset.letter = letter;
    choiceBtn.dataset.level = level;
    choiceBtn.dataset.label = '';
    choiceBtn.dataset.story = '';
    choiceBtn.dataset.image = '';
    choiceBtn.dataset.nextType = '';

    const emoji = letter === 'a' ? '🅰️' : '🅱️';
    const letterUpper = letter.toUpperCase();

    choiceBtn.innerHTML = `
      <span class="choice-tree-icon">${emoji}</span>
      <span class="choice-tree-label">${letterUpper} - (입력 필요)</span>
      <span class="choice-tree-badge">+</span>
    `;

    // 클릭 시 편집 패널 열기
    choiceBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openEditPanel(choiceBtn);
    });

    // 하위 선택지 컨테이너
    const subContainer = document.createElement('div');
    subContainer.className = 'choice-tree-level';
    subContainer.id = `${choiceId}-sub`;

    container.appendChild(choiceBtn);
    container.appendChild(subContainer);

    return container;
  },

  createChoice(parentId, letter, level) {
    const choiceId = `choice-${Date.now()}-${this.choiceCounter++}-${letter}`;
    const indent = level * 2;

    const choiceDiv = document.createElement('div');
    choiceDiv.id = choiceId;
    choiceDiv.className = 'choice-node';
    choiceDiv.dataset.parentId = parentId;
    choiceDiv.dataset.letter = letter;
    choiceDiv.dataset.level = level;

    const letterUpper = letter.toUpperCase();
    const emoji = letter === 'a' ? '🅰️' : '🅱️';

    // 경로 표시 생성
    const breadcrumb = this.generateBreadcrumb(parentId, letterUpper);

    choiceDiv.innerHTML = `
      <div class="card soft-card" style="margin-left: ${indent}rem;">
        ${level > 0 ? breadcrumb : ''}
        <div class="choice-header">
          <div class="choice-header-left">
            <button class="collapse-toggle-btn" title="하위 선택지 접기/펼치기">
              <span class="collapse-icon">▼</span>
            </button>
            <span class="text-2xl">${emoji}</span>
            <h4 class="font-semibold text-cyan-300">선택지 ${letterUpper}</h4>
            ${level > 0 ? `<span class="pill text-xs">레벨 ${level + 1}</span>` : ''}
          </div>
          ${level > 0 ? `<button class="delete-choice-btn px-2 py-1 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-xs border border-red-500/50 transition">🗑️ 삭제</button>` : ''}
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-2">선택지 텍스트 <span class="text-red-400">*</span></label>
            <input type="text" class="choice-label w-full" placeholder="예: 숲으로 들어간다" maxlength="100">
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">다음 이야기</label>
            <textarea class="choice-story w-full h-24 resize-none" placeholder="이 선택을 하면 어떤 일이 벌어질까요?" maxlength="500"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">이미지 (선택사항)</label>
            <div class="flex gap-2 items-start">
              <input type="file" class="choice-image-file flex-1" accept="image/*">
              <button type="button" class="upload-choice-image px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-xs font-medium whitespace-nowrap">업로드</button>
            </div>
            <input type="hidden" class="choice-image">
            <div class="choice-image-preview mt-2"></div>
            <p class="text-xs text-slate-400 mt-1">💡 최대 2MB까지 업로드 가능합니다</p>
          </div>

          <div class="choice-actions flex gap-2">
            <button class="add-subchoice-btn flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/40 rounded-lg border border-blue-500/50 transition text-sm font-medium">
              ➕ 하위 선택지 추가
            </button>
            <button class="set-ending-btn flex-1 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/40 rounded-lg border border-purple-500/50 transition text-sm font-medium">
              🏁 엔딩으로
            </button>
          </div>

          <div class="ending-container hidden mt-3">
            <div class="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30 space-y-3">
              <div>
                <label class="block text-sm font-medium mb-2">엔딩 제목</label>
                <input type="text" class="ending-title w-full" placeholder="예: 해피 엔딩" maxlength="50">
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">엔딩 메시지</label>
                <textarea class="ending-message w-full h-20 resize-none" placeholder="마지막 메시지를 입력하세요" maxlength="300"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">엔딩 이미지 (선택사항)</label>
                <div class="flex gap-2 items-start">
                  <input type="file" class="ending-image-file flex-1" accept="image/*">
                  <button type="button" class="upload-ending-image px-3 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-xs font-medium whitespace-nowrap">업로드</button>
                </div>
                <input type="hidden" class="ending-image">
                <div class="ending-image-preview mt-2"></div>
                <p class="text-xs text-slate-400 mt-1">💡 최대 2MB까지 업로드 가능합니다</p>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">엔딩 타입</label>
                <select class="ending-type w-full">
                  <option value="happy">😊 해피 엔딩</option>
                  <option value="sad">😢 새드 엔딩</option>
                  <option value="neutral">😐 중립적 엔딩</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="subchoices-container mt-4"></div>
      </div>
    `;

    this.attachChoiceEventListeners(choiceDiv);
    return choiceDiv;
  },

  attachChoiceEventListeners(choiceDiv) {
    const addBtn = choiceDiv.querySelector('.add-subchoice-btn');
    const endingBtn = choiceDiv.querySelector('.set-ending-btn');
    const deleteBtn = choiceDiv.querySelector('.delete-choice-btn');
    const endingContainer = choiceDiv.querySelector('.ending-container');
    const subContainer = choiceDiv.querySelector('.subchoices-container');
    const collapseBtn = choiceDiv.querySelector('.collapse-toggle-btn');
    const collapseIcon = choiceDiv.querySelector('.collapse-icon');

    // 접기/펼치기 버튼
    if (collapseBtn) {
      collapseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        SoundModule.playButtonClick();

        const isCollapsed = choiceDiv.classList.contains('collapsed');

        if (isCollapsed) {
          // 펼치기
          choiceDiv.classList.remove('collapsed');
          collapseIcon.textContent = '▼';
          collapseBtn.classList.remove('collapsed');
          collapseBtn.title = '하위 선택지 접기';
        } else {
          // 접기
          choiceDiv.classList.add('collapsed');
          collapseIcon.textContent = '▶';
          collapseBtn.classList.add('collapsed');
          collapseBtn.title = '하위 선택지 펼치기';
        }

        // 하위 항목 수 업데이트
        this.updateSubchoiceCount(choiceDiv);
      });
    }

    // 초기 하위 항목 수 표시
    this.updateSubchoiceCount(choiceDiv);

    // 입력 필드에 포커스할 때 형제 노드 자동 접기
    const inputs = choiceDiv.querySelectorAll(':scope > .card > .space-y-3 input, :scope > .card > .space-y-3 textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        this.collapseSiblings(choiceDiv);
      });
    });

    // 선택지 이미지 업로드 버튼
    const uploadBtn = choiceDiv.querySelector('.upload-choice-image');
    const imageFile = choiceDiv.querySelector('.choice-image-file');
    const imageInput = choiceDiv.querySelector('.choice-image');
    const imagePreview = choiceDiv.querySelector('.choice-image-preview');

    uploadBtn.addEventListener('click', async () => {
      if (!imageFile.files || imageFile.files.length === 0) {
        showToast('❌ 이미지를 선택해주세요', 'error');
        return;
      }

      const file = imageFile.files[0];

      // 크기 확인 (2MB)
      if (file.size > 2 * 1024 * 1024) {
        showToast('❌ 이미지 크기는 2MB 이하여야 합니다', 'error');
        return;
      }

      try {
        SoundModule.playButtonClick();
        showLoading('이미지 처리 중...');

        // 이미지 압축
        const compressedFile = await resizeAndCompressImage(file);
        const imageBase64 = await uploadImageToBase64(compressedFile);

        imageInput.value = imageBase64;

        // 미리보기 표시
        imagePreview.innerHTML = `
          <div class="relative inline-block">
            <img src="${imageBase64}" alt="미리보기" class="w-32 h-32 object-cover rounded-lg border border-white/10">
            <button type="button" class="delete-choice-image-btn absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold transition">✕</button>
          </div>
          <p class="text-xs text-green-400 mt-1">✅ 처리 완료</p>
        `;

        // 삭제 버튼 이벤트 리스너
        imagePreview.querySelector('.delete-choice-image-btn').addEventListener('click', () => {
          imageInput.value = '';
          imagePreview.innerHTML = '';
          showToast('🗑️ 이미지가 제거되었습니다');
        });

        showToast('✅ 이미지가 추가되었습니다', 'success');
      } catch (err) {
        showToast('❌ 이미지 업로드 실패: ' + err.message, 'error');
      } finally {
        hideLoading();
      }
    });

    // 엔딩 이미지 업로드 버튼
    const uploadEndingBtn = choiceDiv.querySelector('.upload-ending-image');
    const endingImageFile = choiceDiv.querySelector('.ending-image-file');
    const endingImageInput = choiceDiv.querySelector('.ending-image');
    const endingImagePreview = choiceDiv.querySelector('.ending-image-preview');

    uploadEndingBtn.addEventListener('click', async () => {
      if (!endingImageFile.files || endingImageFile.files.length === 0) {
        showToast('❌ 이미지를 선택해주세요', 'error');
        return;
      }

      const file = endingImageFile.files[0];

      // 크기 확인 (2MB)
      if (file.size > 2 * 1024 * 1024) {
        showToast('❌ 이미지 크기는 2MB 이하여야 합니다', 'error');
        return;
      }

      try {
        SoundModule.playButtonClick();
        showLoading('이미지 처리 중...');

        // 이미지 압축
        const compressedFile = await resizeAndCompressImage(file);
        const imageBase64 = await uploadImageToBase64(compressedFile);

        endingImageInput.value = imageBase64;

        // 미리보기 표시
        endingImagePreview.innerHTML = `
          <div class="relative inline-block">
            <img src="${imageBase64}" alt="미리보기" class="w-32 h-32 object-cover rounded-lg border border-white/10">
            <button type="button" class="delete-ending-image-btn absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold transition">✕</button>
          </div>
          <p class="text-xs text-green-400 mt-1">✅ 처리 완료</p>
        `;

        // 삭제 버튼 이벤트 리스너
        endingImagePreview.querySelector('.delete-ending-image-btn').addEventListener('click', () => {
          endingImageInput.value = '';
          endingImagePreview.innerHTML = '';
          showToast('🗑️ 엔딩 이미지가 제거되었습니다');
        });

        showToast('✅ 엔딩 이미지가 추가되었습니다', 'success');
      } catch (err) {
        showToast('❌ 이미지 처리 실패: ' + err.message, 'error');
      } finally {
        hideLoading();
      }
    });

    // 하위 선택지 추가
    addBtn.addEventListener('click', () => {
      SoundModule.playButtonClick();

      // 이미 엔딩으로 설정된 경우
      if (choiceDiv.dataset.nextType === 'ending') {
        showToast('❌ 엔딩으로 설정된 선택지에는 하위 선택지를 추가할 수 없습니다', 'error');
        return;
      }

      // 이미 하위 선택지가 있는 경우
      if (subContainer.children.length > 0) {
        showToast('ℹ️ 이미 하위 선택지가 있습니다', 'error');
        return;
      }

      const level = parseInt(choiceDiv.dataset.level);
      const choiceA = this.createChoice(choiceDiv.id, 'a', level + 1);
      const choiceB = this.createChoice(choiceDiv.id, 'b', level + 1);

      subContainer.appendChild(choiceA);
      subContainer.appendChild(choiceB);

      choiceDiv.dataset.nextType = 'continue';
      addBtn.style.background = 'rgba(59, 130, 246, 0.4)';
      addBtn.textContent = '✅ 하위 선택지 추가됨';
      addBtn.disabled = true;

      // 현재 노드 펼치기 (하위 선택지를 보여주기 위해)
      choiceDiv.classList.remove('collapsed');
      if (collapseIcon) collapseIcon.textContent = '▼';
      if (collapseBtn) collapseBtn.classList.remove('collapsed');

      showToast('➕ 하위 선택지가 추가되었습니다');

      setTimeout(() => {
        choiceA.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    });

    // 엔딩 설정
    endingBtn.addEventListener('click', () => {
      SoundModule.playButtonClick();

      if (choiceDiv.dataset.nextType === 'ending') {
        // 엔딩 취소
        choiceDiv.dataset.nextType = '';
        endingContainer.classList.add('hidden');
        endingBtn.style.background = '';
        endingBtn.textContent = '🏁 엔딩으로';
        addBtn.disabled = false;
        showToast('엔딩이 취소되었습니다');
      } else {
        // 하위 선택지가 있는 경우
        if (subContainer.children.length > 0) {
          showToast('❌ 하위 선택지가 있는 경우 엔딩으로 설정할 수 없습니다', 'error');
          return;
        }

        // 엔딩 설정
        choiceDiv.dataset.nextType = 'ending';
        endingContainer.classList.remove('hidden');
        endingBtn.style.background = 'rgba(139, 92, 246, 0.4)';
        endingBtn.textContent = '✅ 엔딩으로 설정됨';
        addBtn.disabled = true;
        showToast('🏁 엔딩으로 설정되었습니다');
      }
    });

    // 삭제 버튼 (루트 선택지는 삭제 불가)
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        if (confirm('이 선택지와 하위 선택지를 모두 삭제하시겠습니까?')) {
          SoundModule.playButtonClick();
          choiceDiv.remove();
          showToast('🗑️ 선택지가 삭제되었습니다');
        }
      });
    }
  },

  validateStory() {
    const title = document.getElementById('storyTitle').value.trim();
    if (!title) {
      showToast('❌ 제목을 입력해주세요', 'error');
      document.getElementById('storyTitle').focus();
      return false;
    }

    const startStory = document.getElementById('startStory').value.trim();
    if (!startStory) {
      showToast('❌ 시작 이야기를 입력해주세요', 'error');
      document.getElementById('startStory').focus();
      return false;
    }

    const rootChoices = this.compactMode
      ? document.querySelectorAll('.choice-tree-item[data-parent-id="root"]')
      : document.querySelectorAll('.choice-node[data-parent-id="root"]');

    if (rootChoices.length === 0) {
      showToast('❌ 최소 1개의 선택지가 필요합니다', 'error');
      return false;
    }

    if (this.compactMode) {
      for (const choice of rootChoices) {
        if (!(choice.dataset.label || '').trim()) {
          showToast('❌ 모든 선택지에 텍스트를 입력해주세요', 'error');
          return false;
        }
      }
    } else {
      for (const choice of rootChoices) {
        if (!choice.querySelector('.choice-label').value.trim()) {
          showToast('❌ 모든 선택지에 텍스트를 입력해주세요', 'error');
          choice.querySelector('.choice-label').focus();
          return false;
        }
      }
    }

    return true;
  },

  exportStory() {
    if (!this.validateStory()) return null;

    // 편집 중인 스토리라면 기존 ID 재사용, 아니면 새 ID 생성
    const storyId = this.editingStoryId || `story-${Date.now()}`;

    const story = {
      id: storyId,
      metadata: {
        title: document.getElementById('storyTitle').value.trim(),
        author: document.getElementById('storyAuthor').value.trim() || '익명',
        description: document.getElementById('storyDescription').value.trim(),
        theme: ThemeModule.currentTheme,
        createdAt: new Date().toISOString()
      },
      nodes: {},
      startNodeId: 'start'
    };

    // 시작 노드
    const startImageUrl = document.getElementById('startImage').value.trim();
    story.nodes['start'] = {
      id: 'start',
      type: 'story',
      emoji: '⭐',
      text: document.getElementById('startStory').value.trim(),
      image: startImageUrl || '',
      choices: []
    };

    // 모든 선택지를 재귀적으로 처리
    if (this.compactMode) {
      const rootChoices = document.querySelectorAll('.choice-tree-item[data-parent-id="root"]');
      rootChoices.forEach(choiceBtn => {
        const choiceData = this.buildCompactChoiceNode(choiceBtn, story);
        if (choiceData) {
          story.nodes['start'].choices.push({
            label: choiceData.label,
            emoji: choiceData.emoji,
            nextId: choiceData.nodeId
          });
        }
      });
    } else {
      const rootChoices = document.querySelectorAll('.choice-node[data-parent-id="root"]');
      rootChoices.forEach(choiceEl => {
        const choiceData = this.buildChoiceNode(choiceEl, story);
        if (choiceData) {
          story.nodes['start'].choices.push({
            label: choiceData.label,
            emoji: choiceData.emoji,
            nextId: choiceData.nodeId
          });
        }
      });
    }

    return story;
  },

  buildChoiceNode(choiceEl, story) {
    const nodeId = choiceEl.id;
    const label = choiceEl.querySelector('.choice-label').value.trim();
    const storyText = choiceEl.querySelector('.choice-story').value.trim();
    const imageUrl = choiceEl.querySelector('.choice-image').value.trim();
    const nextType = choiceEl.dataset.nextType || '';
    const letter = choiceEl.dataset.letter;
    const emoji = letter === 'a' ? '⭐' : '💫';

    if (!label) return null;

    // 엔딩 노드
    if (nextType === 'ending') {
      const endingImageUrl = choiceEl.querySelector('.ending-image')?.value.trim() || '';

      story.nodes[nodeId] = {
        id: nodeId,
        type: 'ending',
        emoji: emoji,
        text: storyText || '이야기가 끝났습니다.',
        image: imageUrl || '',
        ending: {
          title: choiceEl.querySelector('.ending-title')?.value.trim() || '엔딩',
          message: choiceEl.querySelector('.ending-message')?.value.trim() || '',
          type: choiceEl.querySelector('.ending-type')?.value || 'neutral',
          image: endingImageUrl
        }
      };
    } else {
      // 일반 스토리 노드
      story.nodes[nodeId] = {
        id: nodeId,
        type: 'story',
        emoji: emoji,
        text: storyText || '이야기가 계속됩니다...',
        image: imageUrl || '',
        choices: []
      };

      // 하위 선택지 처리
      const subChoices = choiceEl.querySelectorAll(':scope > .card > .subchoices-container > .choice-node');
      if (subChoices.length > 0) {
        subChoices.forEach(subChoice => {
          const subData = this.buildChoiceNode(subChoice, story);
          if (subData) {
            story.nodes[nodeId].choices.push({
              label: subData.label,
              emoji: subData.emoji,
              nextId: subData.nodeId
            });
          }
        });
      } else {
        // 하위 선택지가 없으면 기본 엔딩
        const endingId = `ending-default-${nodeId}`;
        story.nodes[endingId] = {
          id: endingId,
          type: 'ending',
          emoji: '🏁',
          text: '이야기가 끝났습니다.',
          ending: {
            title: '이야기 끝',
            message: '다른 선택을 해보세요!',
            type: 'neutral'
          }
        };
        story.nodes[nodeId].choices.push({
          label: '다음',
          emoji: '➡️',
          nextId: endingId
        });
      }
    }

    return { nodeId, label, emoji };
  },

  buildCompactChoiceNode(choiceBtn, story) {
    const nodeId = choiceBtn.id;
    const label = (choiceBtn.dataset.label || '').trim();
    const storyText = (choiceBtn.dataset.story || '').trim();
    const imageUrl = (choiceBtn.dataset.image || '').trim();
    const nextType = choiceBtn.dataset.nextType || '';
    const letter = choiceBtn.dataset.letter;
    const emoji = letter === 'a' ? '⭐' : '💫';

    if (!label) return null;

    if (nextType === 'ending') {
      story.nodes[nodeId] = {
        id: nodeId,
        type: 'ending',
        emoji: emoji,
        text: storyText || '이야기가 끝났습니다.',
        image: imageUrl || '',
        ending: {
          title: (choiceBtn.dataset.endingTitle || '엔딩').trim(),
          message: (choiceBtn.dataset.endingMessage || '').trim(),
          type: choiceBtn.dataset.endingType || 'neutral',
          image: ''
        }
      };
    } else {
      story.nodes[nodeId] = {
        id: nodeId,
        type: 'story',
        emoji: emoji,
        text: storyText || '이야기가 계속됩니다...',
        image: imageUrl || '',
        choices: []
      };

      const subContainer = document.getElementById(`${choiceBtn.id}-sub`);
      const subChoices = subContainer?.querySelectorAll(':scope > .choice-tree-container > .choice-tree-item') || [];

      if (subChoices.length > 0) {
        subChoices.forEach(subChoice => {
          const subData = this.buildCompactChoiceNode(subChoice, story);
          if (subData) {
            story.nodes[nodeId].choices.push({
              label: subData.label,
              emoji: subData.emoji,
              nextId: subData.nodeId
            });
          }
        });
      } else {
        const endingId = `ending-default-${nodeId}`;
        story.nodes[endingId] = {
          id: endingId,
          type: 'ending',
          emoji: '🏁',
          text: '이야기가 끝났습니다.',
          ending: {
            title: '이야기 끝',
            message: '다른 선택을 해보세요!',
            type: 'neutral'
          }
        };
        story.nodes[nodeId].choices.push({
          label: '다음',
          emoji: '➡️',
          nextId: endingId
        });
      }
    }

    return { nodeId, label, emoji };
  },

  loadStoryToEditor(story, options = {}) {
    const { preserveTheme = false } = options;
    this.clearEditor(true);

    // 편집 중인 스토리 ID 저장
    this.editingStoryId = story.id;

    document.getElementById('storyTitle').value = story.metadata.title;
    document.getElementById('storyAuthor').value = story.metadata.author || '';
    document.getElementById('storyDescription').value = story.metadata.description || '';

    const startNode = story.nodes['start'];
    if (startNode) {
      document.getElementById('startStory').value = startNode.text || '';
      document.getElementById('startImage').value = startNode.image || '';

      // 시작 이미지 미리보기 표시 (이미지가 있을 때만)
      const startImagePreview = document.getElementById('startImagePreview');
      if (startNode.image) {
        startImagePreview.innerHTML = `
          <div class="relative inline-block">
            <img src="${startNode.image}" alt="미리보기" class="w-32 h-32 object-cover rounded-lg border border-white/10">
            <button type="button" class="delete-start-image absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold transition">✕</button>
          </div>
          <p class="text-xs text-green-400 mt-1">✅ 처리 완료</p>
        `;

        // 삭제 버튼 이벤트 리스너
        startImagePreview.querySelector('.delete-start-image').addEventListener('click', () => {
          document.getElementById('startImage').value = '';
          startImagePreview.innerHTML = '';
          showToast('🗑️ 이미지가 제거되었습니다');
        });
      } else {
        startImagePreview.innerHTML = '';
      }
    }

    if (story.metadata.theme && !preserveTheme) {
      ThemeModule.applyTheme(story.metadata.theme);
      document.getElementById('themeSelector').value = story.metadata.theme;
    }

    // 선택지 로드
    this.addRootChoices();

    setTimeout(() => {
      if (startNode?.choices?.length > 0) {
        if (this.compactMode) {
          // 컴팩트 모드: 트리 버튼 방식으로 로드
          const rootChoices = document.querySelectorAll('.choice-tree-item[data-parent-id="root"]');
          startNode.choices.forEach((choice, index) => {
            const choiceBtn = rootChoices[index];
            if (choiceBtn) {
              this.loadCompactChoiceData(choiceBtn, choice, story);
            }
          });
        } else {
          // 기존 확장 모드
          const rootChoices = document.querySelectorAll('.choice-node[data-parent-id="root"]');
          startNode.choices.forEach((choice, index) => {
            const choiceEl = rootChoices[index];
            if (choiceEl) {
              this.loadChoiceData(choiceEl, choice, story);
            }
          });

          // 모든 선택지를 접은 상태로 시작
          setTimeout(() => {
            this.collapseAllExceptRoot();
          }, 200);
        }
      }

      showToast('📂 스토리를 불러왔습니다.', 'success');
    }, 100);
  },

  // 컴팩트 모드로 선택지 데이터 로드
  loadCompactChoiceData(choiceBtn, choiceData, story) {
    const nextNode = story.nodes[choiceData.nextId];
    if (!nextNode) return;

    // 데이터 저장
    choiceBtn.dataset.label = choiceData.label || '';
    choiceBtn.dataset.story = nextNode.text || '';
    choiceBtn.dataset.image = nextNode.image || '';

    const emoji = choiceBtn.dataset.letter === 'a' ? '🅰️' : '🅱️';
    const letterUpper = choiceBtn.dataset.letter.toUpperCase();

    if (nextNode.type === 'ending') {
      // 엔딩 노드
      choiceBtn.dataset.nextType = 'ending';
      choiceBtn.dataset.endingTitle = nextNode.ending?.title || '';
      choiceBtn.dataset.endingMessage = nextNode.ending?.message || '';
      choiceBtn.dataset.endingType = nextNode.ending?.type || 'neutral';

      choiceBtn.innerHTML = `
        <span class="choice-tree-icon">${emoji}</span>
        <span class="choice-tree-label">${letterUpper} - ${choiceData.label}</span>
        <span class="choice-tree-badge">🏁</span>
      `;
      choiceBtn.classList.add('has-content', 'is-ending');
    } else if (nextNode.choices && nextNode.choices.length > 0) {
      // 하위 선택지가 있는 노드
      choiceBtn.dataset.nextType = 'continue';

      choiceBtn.innerHTML = `
        <span class="choice-tree-icon">${emoji}</span>
        <span class="choice-tree-label">${letterUpper} - ${choiceData.label}</span>
        <span class="choice-tree-badge">${nextNode.choices.length}개</span>
      `;
      choiceBtn.classList.add('has-content');

      // 하위 선택지 추가
      const subContainer = document.getElementById(`${choiceBtn.id}-sub`);
      if (subContainer && nextNode.choices.length > 0) {
        nextNode.choices.forEach((subChoice, idx) => {
          const letter = idx === 0 ? 'a' : 'b';
          const level = parseInt(choiceBtn.dataset.level);
          const compactChoice = this.createCompactChoice(choiceBtn.id, letter, level + 1);

          subContainer.appendChild(compactChoice);

          // 재귀적으로 하위 선택지 로드
          setTimeout(() => {
            const subBtn = compactChoice.querySelector('.choice-tree-item');
            if (subBtn) {
              this.loadCompactChoiceData(subBtn, subChoice, story);
            }
          }, 50);
        });
      }
    } else {
      // 일반 노드 (하위 선택지 없음)
      choiceBtn.innerHTML = `
        <span class="choice-tree-icon">${emoji}</span>
        <span class="choice-tree-label">${letterUpper} - ${choiceData.label}</span>
        <span class="choice-tree-badge">+</span>
      `;
      choiceBtn.classList.add('has-content');
    }
  },

  // 루트 선택지만 펼치고 나머지는 모두 접기
  collapseAllExceptRoot() {
    const allChoices = document.querySelectorAll('.choice-node');

    allChoices.forEach(choice => {
      const level = parseInt(choice.dataset.level);
      const icon = choice.querySelector('.collapse-icon');
      const btn = choice.querySelector('.collapse-toggle-btn');

      // 레벨 1 이상(하위 선택지)은 모두 접기
      if (level > 0) {
        choice.classList.add('collapsed');
        if (icon) icon.textContent = '▶';
        if (btn) btn.classList.add('collapsed');
      }

      // 하위 항목 수 표시
      this.updateSubchoiceCount(choice);
    });
  },

  // 편집 패널 열기
  openEditPanel(choiceBtn) {
    this.currentEditingNode = choiceBtn;
    SoundModule.playButtonClick();

    // 모든 선택지에서 active 클래스 제거
    document.querySelectorAll('.choice-tree-item').forEach(btn => btn.classList.remove('active'));
    choiceBtn.classList.add('active');

    const panel = document.getElementById('editPanel');
    const overlay = document.getElementById('editPanelOverlay');
    const content = document.getElementById('editPanelContent');
    const title = document.getElementById('editPanelTitle');

    // 패널 제목 설정
    const letter = choiceBtn.dataset.letter.toUpperCase();
    const level = parseInt(choiceBtn.dataset.level);
    title.textContent = `선택지 ${letter} 편집 (레벨 ${level + 1})`;

    // 편집 폼 생성
    const label = choiceBtn.dataset.label || '';
    const story = choiceBtn.dataset.story || '';
    const image = choiceBtn.dataset.image || '';
    const nextType = choiceBtn.dataset.nextType || '';
    const isEnding = nextType === 'ending';
    const hasSubchoices = nextType === 'continue';

    content.innerHTML = `
      <div class="space-y-4">
        <div class="input-group">
          <label class="block text-sm font-medium mb-2">선택지 텍스트 <span class="text-red-400">*</span></label>
          <input type="text" id="panel-label" value="${label}" placeholder="예: 숲으로 들어간다" maxlength="100" class="w-full">
        </div>

        <div class="input-group">
          <label class="block text-sm font-medium mb-2">이야기 내용</label>
          <textarea id="panel-story" placeholder="이 선택을 하면 어떤 일이 벌어질까요?" maxlength="500" class="w-full h-32 resize-none">${story}</textarea>
        </div>

        <div class="input-group">
          <label class="block text-sm font-medium mb-2">이미지 (선택)</label>
          <div class="flex gap-2">
            <input type="file" id="panel-image-file" accept="image/*" class="flex-1">
            <button type="button" id="panel-upload-image" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium">업로드</button>
          </div>
          <input type="hidden" id="panel-image" value="${image}">
          <div id="panel-image-preview" class="mt-2">
            ${image ? `<img src="${image}" class="w-32 h-32 object-cover rounded-lg border border-white/10">` : ''}
          </div>
        </div>

        <div class="border-t border-white/10 pt-4 mt-4">
          <label class="block text-sm font-medium mb-3">다음 단계 설정</label>
          <div class="flex gap-2">
            <button type="button" id="panel-add-subchoice" class="flex-1 px-4 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-sm font-medium transition ${hasSubchoices ? 'opacity-50 cursor-not-allowed' : ''}">
              ➕ 하위 선택지 추가
            </button>
            <button type="button" id="panel-set-ending" class="flex-1 px-4 py-2.5 ${isEnding ? 'bg-purple-500/40' : 'bg-purple-500/20 hover:bg-purple-500/30'} border border-purple-500/40 rounded-lg text-sm font-medium transition">
              🏁 ${isEnding ? '엔딩으로 설정됨' : '엔딩으로 설정'}
            </button>
          </div>
        </div>

        <div id="panel-ending-section" class="${isEnding ? '' : 'hidden'}">
          <div class="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30 space-y-3 mt-3">
            <div>
              <label class="block text-sm font-medium mb-2">엔딩 제목</label>
              <input type="text" id="panel-ending-title" value="${choiceBtn.dataset.endingTitle || ''}" placeholder="예: 해피 엔딩" maxlength="50" class="w-full">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">엔딩 메시지</label>
              <textarea id="panel-ending-message" placeholder="마지막 메시지" maxlength="300" class="w-full h-20 resize-none">${choiceBtn.dataset.endingMessage || ''}</textarea>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">엔딩 타입</label>
              <select id="panel-ending-type" class="w-full">
                <option value="happy" ${choiceBtn.dataset.endingType === 'happy' ? 'selected' : ''}>😊 해피 엔딩</option>
                <option value="sad" ${choiceBtn.dataset.endingType === 'sad' ? 'selected' : ''}>😢 새드 엔딩</option>
                <option value="neutral" ${choiceBtn.dataset.endingType === 'neutral' ? 'selected' : ''}>😐 중립적 엔딩</option>
              </select>
            </div>
          </div>
        </div>

        <div class="flex gap-2 pt-4 border-t border-white/10">
          <button type="button" id="panel-save" class="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-medium">💾 저장</button>
          ${level > 0 ? '<button type="button" id="panel-delete" class="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg font-medium">🗑️ 삭제</button>' : ''}
        </div>
      </div>
    `;

    // 이벤트 리스너 연결
    this.attachPanelEventListeners(choiceBtn);

    // 패널 열기
    panel.classList.add('open');
    overlay.classList.add('active');
  },

  // 편집 패널 닫기
  closeEditPanel() {
    const panel = document.getElementById('editPanel');
    const overlay = document.getElementById('editPanelOverlay');

    panel.classList.remove('open');
    overlay.classList.remove('active');

    if (this.currentEditingNode) {
      this.currentEditingNode.classList.remove('active');
      this.currentEditingNode = null;
    }
  },

  // 패널 이벤트 리스너
  attachPanelEventListeners(choiceBtn) {
    // 저장 버튼
    document.getElementById('panel-save')?.addEventListener('click', () => {
      this.saveChoiceFromPanel(choiceBtn);
    });

    // 삭제 버튼
    document.getElementById('panel-delete')?.addEventListener('click', () => {
      if (confirm('이 선택지와 하위 선택지를 모두 삭제하시겠습니까?')) {
        SoundModule.playButtonClick();
        choiceBtn.parentElement.remove();
        this.closeEditPanel();
        showToast('🗑️ 선택지가 삭제되었습니다');
      }
    });

    // 하위 선택지 추가
    document.getElementById('panel-add-subchoice')?.addEventListener('click', () => {
      if (choiceBtn.dataset.nextType === 'ending') {
        showToast('❌ 엔딩으로 설정된 선택지에는 하위 선택지를 추가할 수 없습니다', 'error');
        return;
      }

      if (choiceBtn.dataset.nextType === 'continue') {
        showToast('ℹ️ 이미 하위 선택지가 있습니다', 'error');
        return;
      }

      SoundModule.playButtonClick();
      this.addSubchoices(choiceBtn);
      this.closeEditPanel();
      showToast('➕ 하위 선택지가 추가되었습니다');
    });

    // 엔딩 설정
    document.getElementById('panel-set-ending')?.addEventListener('click', () => {
      const isEnding = choiceBtn.dataset.nextType === 'ending';
      const endingSection = document.getElementById('panel-ending-section');
      const btn = document.getElementById('panel-set-ending');

      if (isEnding) {
        // 엔딩 취소
        choiceBtn.dataset.nextType = '';
        endingSection.classList.add('hidden');
        btn.textContent = '🏁 엔딩으로 설정';
        btn.classList.remove('bg-purple-500/40');
        btn.classList.add('bg-purple-500/20', 'hover:bg-purple-500/30');
        choiceBtn.classList.remove('is-ending');
      } else {
        // 엔딩 설정
        choiceBtn.dataset.nextType = 'ending';
        endingSection.classList.remove('hidden');
        btn.textContent = '🏁 엔딩으로 설정됨';
        btn.classList.add('bg-purple-500/40');
        btn.classList.remove('bg-purple-500/20', 'hover:bg-purple-500/30');
        choiceBtn.classList.add('is-ending');
      }
      SoundModule.playButtonClick();
    });

    // 이미지 업로드
    document.getElementById('panel-upload-image')?.addEventListener('click', async () => {
      const fileInput = document.getElementById('panel-image-file');
      if (!fileInput.files || fileInput.files.length === 0) {
        showToast('❌ 이미지를 선택해주세요', 'error');
        return;
      }

      const file = fileInput.files[0];
      if (file.size > 2 * 1024 * 1024) {
        showToast('❌ 이미지 크기는 2MB 이하여야 합니다', 'error');
        return;
      }

      try {
        SoundModule.playButtonClick();
        showLoading('이미지 처리 중...');

        const compressedFile = await resizeAndCompressImage(file);
        const imageBase64 = await uploadImageToBase64(compressedFile);

        document.getElementById('panel-image').value = imageBase64;
        document.getElementById('panel-image-preview').innerHTML = `
          <img src="${imageBase64}" class="w-32 h-32 object-cover rounded-lg border border-white/10">
        `;

        showToast('✅ 이미지가 추가되었습니다', 'success');
      } catch (err) {
        showToast('❌ 이미지 업로드 실패: ' + err.message, 'error');
      } finally {
        hideLoading();
      }
    });
  },

  // 패널에서 선택지 저장
  saveChoiceFromPanel(choiceBtn) {
    const label = document.getElementById('panel-label').value.trim();

    if (!label) {
      showToast('❌ 선택지 텍스트를 입력해주세요', 'error');
      return;
    }

    SoundModule.playButtonClick();

    // 데이터 저장
    choiceBtn.dataset.label = label;
    choiceBtn.dataset.story = document.getElementById('panel-story').value.trim();
    choiceBtn.dataset.image = document.getElementById('panel-image').value.trim();

    // 엔딩 데이터 저장
    if (choiceBtn.dataset.nextType === 'ending') {
      choiceBtn.dataset.endingTitle = document.getElementById('panel-ending-title').value.trim();
      choiceBtn.dataset.endingMessage = document.getElementById('panel-ending-message').value.trim();
      choiceBtn.dataset.endingType = document.getElementById('panel-ending-type').value;
    }

    // 버튼 텍스트 업데이트
    const emoji = choiceBtn.dataset.letter === 'a' ? '🅰️' : '🅱️';
    const letterUpper = choiceBtn.dataset.letter.toUpperCase();
    const hasSubchoices = choiceBtn.dataset.nextType === 'continue';
    const isEnding = choiceBtn.dataset.nextType === 'ending';

    let badge = '';
    if (hasSubchoices) {
      const subContainer = document.getElementById(`${choiceBtn.id}-sub`);
      const childCount = subContainer?.querySelectorAll(':scope > .choice-tree-container').length || 0;
      badge = `<span class="choice-tree-badge">${childCount}개</span>`;
    } else if (isEnding) {
      badge = '<span class="choice-tree-badge">🏁</span>';
    } else {
      badge = '<span class="choice-tree-badge">+</span>';
    }

    choiceBtn.innerHTML = `
      <span class="choice-tree-icon">${emoji}</span>
      <span class="choice-tree-label">${letterUpper} - ${label}</span>
      ${badge}
    `;

    // 스타일 업데이트
    choiceBtn.classList.add('has-content');

    this.closeEditPanel();
    showToast('✅ 저장되었습니다', 'success');
  },

  // 하위 선택지 추가
  addSubchoices(choiceBtn) {
    const level = parseInt(choiceBtn.dataset.level);
    const subContainer = document.getElementById(`${choiceBtn.id}-sub`);

    if (!subContainer) return;

    const choiceA = this.createCompactChoice(choiceBtn.id, 'a', level + 1);
    const choiceB = this.createCompactChoice(choiceBtn.id, 'b', level + 1);

    subContainer.appendChild(choiceA);
    subContainer.appendChild(choiceB);

    choiceBtn.dataset.nextType = 'continue';

    // 버튼 업데이트
    const emoji = choiceBtn.dataset.letter === 'a' ? '🅰️' : '🅱️';
    const letterUpper = choiceBtn.dataset.letter.toUpperCase();
    const label = choiceBtn.dataset.label || `${letterUpper} - (입력 필요)`;

    choiceBtn.innerHTML = `
      <span class="choice-tree-icon">${emoji}</span>
      <span class="choice-tree-label">${label}</span>
      <span class="choice-tree-badge">2개</span>
    `;
  },

  // 하위 선택지 개수 표시 업데이트
  updateSubchoiceCount(choiceDiv) {
    const subContainer = choiceDiv.querySelector('.subchoices-container');
    const headerLeft = choiceDiv.querySelector('.choice-header-left');

    if (!subContainer || !headerLeft) return;

    // 기존 카운터 제거
    const existingCounter = headerLeft.querySelector('.subchoice-counter');
    if (existingCounter) {
      existingCounter.remove();
    }

    // 직접 하위 선택지 수 계산
    const directChildren = subContainer.querySelectorAll(':scope > .choice-node');
    const childCount = directChildren.length;

    // 하위 선택지가 있고 접혀있을 때만 표시
    if (childCount > 0 && choiceDiv.classList.contains('collapsed')) {
      const counter = document.createElement('span');
      counter.className = 'subchoice-counter choice-collapse-indicator';
      counter.textContent = `하위 ${childCount}개`;
      headerLeft.appendChild(counter);
    }
  },

  loadChoiceData(choiceEl, choiceData, story) {
    const nextNode = story.nodes[choiceData.nextId];
    if (!nextNode) return;

    choiceEl.querySelector('.choice-label').value = choiceData.label || '';
    choiceEl.querySelector('.choice-story').value = nextNode.text || '';
    choiceEl.querySelector('.choice-image').value = nextNode.image || '';

    // 선택지 이미지 미리보기 표시 (이미지가 있을 때만)
    const imagePreview = choiceEl.querySelector('.choice-image-preview');
    if (nextNode.image) {
      imagePreview.innerHTML = `
        <div class="relative inline-block">
          <img src="${nextNode.image}" alt="미리보기" class="w-32 h-32 object-cover rounded-lg border border-white/10">
          <button type="button" class="delete-choice-image absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold transition">✕</button>
        </div>
        <p class="text-xs text-green-400 mt-1">✅ 처리 완료</p>
      `;

      // 삭제 버튼 이벤트 리스너
      imagePreview.querySelector('.delete-choice-image').addEventListener('click', () => {
        choiceEl.querySelector('.choice-image').value = '';
        imagePreview.innerHTML = '';
        showToast('🗑️ 이미지가 제거되었습니다');
      });
    } else {
      imagePreview.innerHTML = '';
    }

    if (nextNode.type === 'ending') {
      choiceEl.querySelector('.set-ending-btn').click();
      choiceEl.querySelector('.ending-title').value = nextNode.ending?.title || '';
      choiceEl.querySelector('.ending-message').value = nextNode.ending?.message || '';
      choiceEl.querySelector('.ending-type').value = nextNode.ending?.type || 'neutral';

      // 엔딩 이미지 설정 (이미지가 있을 때만)
      const endingImagePreview = choiceEl.querySelector('.ending-image-preview');
      if (nextNode.ending?.image) {
        choiceEl.querySelector('.ending-image').value = nextNode.ending.image;
        endingImagePreview.innerHTML = `
          <div class="relative inline-block">
            <img src="${nextNode.ending.image}" alt="미리보기" class="w-32 h-32 object-cover rounded-lg border border-white/10">
            <button type="button" class="delete-ending-image absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold transition">✕</button>
          </div>
          <p class="text-xs text-green-400 mt-1">✅ 처리 완료</p>
        `;

        // 삭제 버튼 이벤트 리스너
        endingImagePreview.querySelector('.delete-ending-image').addEventListener('click', () => {
          choiceEl.querySelector('.ending-image').value = '';
          endingImagePreview.innerHTML = '';
          showToast('🗑️ 엔딩 이미지가 제거되었습니다');
        });
      } else {
        endingImagePreview.innerHTML = '';
      }
    } else if (nextNode.choices && nextNode.choices.length > 0) {
      choiceEl.querySelector('.add-subchoice-btn').click();

      setTimeout(() => {
        const subChoices = choiceEl.querySelectorAll(':scope > .card > .subchoices-container > .choice-node');
        nextNode.choices.forEach((subChoice, idx) => {
          if (subChoices[idx]) {
            this.loadChoiceData(subChoices[idx], subChoice, story);
          }
        });
      }, 100);
    }
  },

  clearEditor(keepEmpty = false) {
    document.getElementById('storyTitle').value = '';
    document.getElementById('storyAuthor').value = '';
    document.getElementById('storyDescription').value = '';
    document.getElementById('startStory').value = '';
    document.getElementById('choiceGroupsContainer').innerHTML = '';
    this.choiceCounter = 0;
    this.editingStoryId = null; // 편집 ID 초기화
    if (!keepEmpty) this.addRootChoices();
  },

  showPreview(story) {
    const modal = document.getElementById('previewModal');
    const nodeList = Object.values(story.nodes).map(node => `
      <div class="p-3 bg-white/5 rounded-lg mb-2">
        <div class="flex items-center gap-2 mb-1">
          <span>${node.type === 'ending' ? '🏁' : '📖'}</span>
          <span class="font-medium text-xs">${node.id}</span>
          <span class="text-xs text-slate-400">${node.choices ? `(선택지 ${node.choices.length}개)` : ''}</span>
        </div>
        <p class="text-sm text-slate-300 truncate">${node.text?.substring(0, 50)}...</p>
      </div>
    `).join('');

    modal.innerHTML = `
      <div class="card max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold">👁️ 스토리 미리보기</h2>
          <button id="closePreviewBtn" class="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">✕</button>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-2">${story.metadata.title}</h3>
          <p class="text-slate-400 text-sm">${story.metadata.description || '설명 없음'}</p>
          <div class="flex gap-4 mt-2 text-xs text-slate-500 flex-wrap">
            <span>✍️ ${story.metadata.author || '익명'}</span>
            <span>🎨 ${ThemeModule.themes[story.metadata.theme]?.name || '기본'}</span>
            <span>📚 ${Object.keys(story.nodes).length}개 노드</span>
          </div>
        </div>

        <div class="border-t border-white/10 pt-6">
          <h4 class="font-medium mb-4">📋 스토리 구조</h4>
          <div class="max-h-64 overflow-y-auto">
            ${nodeList}
          </div>
        </div>

        <div class="mt-6 pt-6 border-t border-white/10 flex gap-3">
          <button id="playFromPreviewBtn" class="flex-1 px-4 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium transition">▶️ 체험하기</button>
          <button id="closePreviewBtn2" class="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition">닫기</button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    document.getElementById('closePreviewBtn').addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    });

    document.getElementById('closePreviewBtn2').addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    });

    document.getElementById('playFromPreviewBtn').addEventListener('click', () => {
      localStorage.setItem('tempPlayStory', JSON.stringify(story));
      window.location.href = 'player.html?temp=true';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    });
  },

  // JSON 파일 불러오기
  loadFromJsonFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const fileContent = e.target.result;
          const story = JsonConverterModule.parseJsonFile(fileContent);
          this.loadStoryToEditor(story, { preserveTheme: true });
          resolve(story);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('파일을 읽을 수 없습니다.'));
      };

      reader.readAsText(file);
    });
  }
};

// ==========================================
// 페이지 초기화
// ==========================================
function initEditorPage() {
  // 모드 초기화 (라이트/다크)
  ModeModule.init();

  // 테마 & 사운드 초기화
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || DEFAULT_THEME;
  document.getElementById('themeSelector').value = savedTheme;
  document.getElementById('themeSelectorMobile').value = savedTheme;
  ThemeModule.applyTheme(savedTheme);
  SoundModule.init();
  SoundModule.updateIcons();

  // 테마 선택
  document.getElementById('themeSelector').addEventListener('change', (e) => {
    ThemeModule.applyTheme(e.target.value);
    document.getElementById('themeSelectorMobile').value = e.target.value;
    SoundModule.playButtonClick();
  });

  document.getElementById('themeSelectorMobile').addEventListener('change', (e) => {
    ThemeModule.applyTheme(e.target.value);
    document.getElementById('themeSelector').value = e.target.value;
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

  // 시작 이미지 업로드
  document.getElementById('uploadStartImage').addEventListener('click', async () => {
    const fileInput = document.getElementById('startImageFile');
    const imageInput = document.getElementById('startImage');
    const imagePreview = document.getElementById('startImagePreview');

    if (!fileInput.files || fileInput.files.length === 0) {
      showToast('❌ 이미지를 선택해주세요', 'error');
      return;
    }

    const file = fileInput.files[0];

    // 크기 확인 (2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('❌ 이미지 크기는 2MB 이하여야 합니다', 'error');
      return;
    }

    try {
      SoundModule.playButtonClick();
      showLoading('이미지 처리 중...');

      // 이미지 압축
      const compressedFile = await resizeAndCompressImage(file);
      const imageBase64 = await uploadImageToBase64(compressedFile);

      imageInput.value = imageBase64;

      // 미리보기 표시
      imagePreview.innerHTML = `
        <div class="relative inline-block">
          <img src="${imageBase64}" alt="미리보기" class="w-32 h-32 object-cover rounded-lg border border-white/10">
          <button type="button" class="delete-start-image-btn absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold transition">✕</button>
        </div>
        <p class="text-xs text-green-400 mt-1">✅ 처리 완료</p>
      `;

      // 삭제 버튼 이벤트 리스너
      imagePreview.querySelector('.delete-start-image-btn').addEventListener('click', () => {
        imageInput.value = '';
        imagePreview.innerHTML = '';
        showToast('🗑️ 시작 이미지가 제거되었습니다');
      });

      showToast('✅ 이미지가 추가되었습니다', 'success');
    } catch (err) {
      showToast('❌ 이미지 처리 실패: ' + err.message, 'error');
    } finally {
      hideLoading();
    }
  });

  // 저장하기
  document.getElementById('saveStoryBtn').addEventListener('click', async () => {
    SoundModule.playButtonClick();
    const story = EditorModule.exportStory();
    if (story) {
      StorageModule.saveStory(story);
      SpreadsheetModule.saveStory(story);
      showToast('✅ 스토리가 저장되었습니다!', 'success');
    }
  });

  // 미리보기
  document.getElementById('previewStoryBtn').addEventListener('click', () => {
    SoundModule.playButtonClick();
    const story = EditorModule.exportStory();
    if (story) EditorModule.showPreview(story);
  });

  // 체험하기
  document.getElementById('playStoryBtn').addEventListener('click', () => {
    SoundModule.playButtonClick();
    const story = EditorModule.exportStory();
    if (story) {
      localStorage.setItem('tempPlayStory', JSON.stringify(story));
      window.location.href = 'player.html?temp=true';
    }
  });

  // 전체 지우기
  document.getElementById('clearEditorBtn').addEventListener('click', () => {
    if (confirm('정말로 모든 내용을 지우시겠습니까?')) {
      SoundModule.playButtonClick();
      EditorModule.clearEditor();
      showToast('✅ 에디터가 초기화되었습니다');
    }
  });

  // 모두 펼치기
  document.getElementById('expandAllBtn')?.addEventListener('click', () => {
    SoundModule.playButtonClick();
    EditorModule.toggleAllChoices(true);
    showToast('▼ 모든 선택지를 펼쳤습니다');
  });

  // 모두 접기
  document.getElementById('collapseAllBtn')?.addEventListener('click', () => {
    SoundModule.playButtonClick();
    EditorModule.toggleAllChoices(false);
    showToast('▶ 모든 선택지를 접었습니다');
  });

  // 편집 패널 닫기
  document.getElementById('closePanelBtn')?.addEventListener('click', () => {
    EditorModule.closeEditPanel();
  });

  document.getElementById('editPanelOverlay')?.addEventListener('click', () => {
    EditorModule.closeEditPanel();
  });

  // JSON 파일 불러오기
  document.getElementById('loadJsonBtn')?.addEventListener('click', () => {
    document.getElementById('jsonFileInput').click();
  });

  document.getElementById('jsonFileInput')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 확장자 확인
    if (!file.name.endsWith('.json')) {
      showToast('❌ JSON 파일만 업로드 가능합니다', 'error');
      e.target.value = '';
      return;
    }

    try {
      SoundModule.playButtonClick();
      showLoading('JSON 파일 변환 중...');

      await EditorModule.loadFromJsonFile(file);

      showToast('✅ JSON 파일을 불러왔습니다!', 'success');
    } catch (error) {
      showToast('❌ JSON 변환 실패: ' + error.message, 'error');
    } finally {
      hideLoading();
      e.target.value = ''; // 입력 초기화
    }
  });

  // URL 파라미터로 스토리 로드
  const editId = getUrlParam('edit');
  if (editId) {
    const story = StorageModule.getStory(editId);
    if (story) EditorModule.loadStoryToEditor(story);
  } else {
    // 새 작성자는 기본 선택지를 바로 볼 수 있게 한다
    EditorModule.addRootChoices();
  }
}

// 페이지 로드
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEditorPage);
} else {
  initEditorPage();
}

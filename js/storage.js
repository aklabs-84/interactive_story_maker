// ==========================================
// 로컬 스토리지 모듈
// ==========================================

const StorageModule = {
  // 모든 스토리 가져오기
  getAllStories() {
    const data = localStorage.getItem(STORAGE_KEYS.STORIES);
    return data ? JSON.parse(data) : [];
  },

  // 특정 스토리 가져오기
  getStory(id) {
    const stories = this.getAllStories();
    return stories.find(s => s.id === id);
  },

  // 최신 스토리 가져오기
  getLatestStory() {
    const stories = this.getAllStories();
    return stories.length > 0 ? stories[0] : null;
  },

  // 스토리 저장
  saveStory(story, addToTop = true) {
    const stories = this.getAllStories();
    const existingIndex = stories.findIndex(s => s.id === story.id);
    
    if (existingIndex >= 0) {
      stories[existingIndex] = story;
    } else {
      if (addToTop) {
        stories.unshift(story);
      } else {
        stories.push(story);
      }
    }
    
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
    return true;
  },

  // 스토리 삭제
  deleteStory(id) {
    const stories = this.getAllStories();
    const filtered = stories.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(filtered));
    return true;
  },

  // 스토리 순서 저장
  saveStoriesOrder(stories) {
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
  },

  // 스토리 순서 변경
  reorderStory(fromIndex, toIndex) {
    const stories = this.getAllStories();
    const [movedStory] = stories.splice(fromIndex, 1);
    stories.splice(toIndex, 0, movedStory);
    this.saveStoriesOrder(stories);
    return stories;
  },

  // 중복 스토리 제거 (ID 기준으로 유니크하게 만들기)
  removeDuplicates() {
    const allStories = this.getAllStories();
    const uniqueStoriesMap = new Map();

    // ID를 기준으로 첫 번째 항목만 유지 (최신 순서 유지)
    allStories.forEach(story => {
      if (!uniqueStoriesMap.has(story.id)) {
        uniqueStoriesMap.set(story.id, story);
      }
    });

    const uniqueStories = Array.from(uniqueStoriesMap.values());
    const removedCount = allStories.length - uniqueStories.length;

    if (removedCount > 0) {
      localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(uniqueStories));
    }

    return removedCount;
  }
};
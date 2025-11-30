// ==========================================
// 구글 스프레드시트 연동 모듈
// ==========================================

const SpreadsheetModule = {
  // 스토리를 스프레드시트에 저장
  async saveStory(story) {
    try {
      const data = {
        action: 'save',
        storyId: story.id,
        timestamp: formatDate(),
        title: story.metadata.title,
        author: story.metadata.author || '익명',
        description: story.metadata.description || '',
        theme: story.metadata.theme,
        ownerId: story.metadata.ownerId || (typeof UserModule !== 'undefined' ? UserModule.getId() : ''),
        storyData: JSON.stringify(story)
      };

      await fetch(CONFIG.GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        mode: 'no-cors'
      });

      console.log('✅ 스프레드시트 저장 완료');
      return true;
    } catch (error) {
      console.error('❌ 스프레드시트 저장 오류:', error);
      return false;
    }
  },

  // 스프레드시트에서 특정 스토리 불러오기 (Drive에서 JSON 다운로드)
  async loadStory(storyId) {
    try {
      showLoading('스토리를 불러오는 중...');

      // 1. 스프레드시트에서 Drive URL 가져오기
      const url = `${CONFIG.GOOGLE_APPS_SCRIPT_URL}?action=load&storyId=${encodeURIComponent(storyId)}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error('서버 응답 오류');

      const result = await response.json();

      if (result.status === 'success' && result.data && result.data.fileUrl) {
        // 2. Drive URL에서 JSON 파일 다운로드
        const fileUrl = result.data.fileUrl;
        const jsonResponse = await fetch(fileUrl);

        if (!jsonResponse.ok) throw new Error('JSON 파일 다운로드 실패');

        const storyJson = await jsonResponse.json();
        hideLoading();

        return storyJson;
      }

      hideLoading();
      return null;
    } catch (error) {
      hideLoading();
      console.error('❌ 스토리 불러오기 오류:', error);
      return null;
    }
  },

  // 최신 스토리 불러오기 (Drive에서 JSON 다운로드)
  async loadLatestStory() {
    try {
      showLoading('최신 스토리를 불러오는 중...');

      // 1. 스프레드시트에서 최신 스토리 정보 가져오기
      const url = `${CONFIG.GOOGLE_APPS_SCRIPT_URL}?action=latest`;
      const response = await fetch(url);

      if (!response.ok) throw new Error('서버 응답 오류');

      const result = await response.json();

      if (result.status === 'success' && result.data && result.data.fileUrl) {
        // 2. Drive URL에서 JSON 파일 다운로드
        const fileUrl = result.data.fileUrl;
        const jsonResponse = await fetch(fileUrl);

        if (!jsonResponse.ok) throw new Error('JSON 파일 다운로드 실패');

        const storyJson = await jsonResponse.json();
        hideLoading();

        return {
          story: storyJson,
          storyId: result.data.storyId
        };
      }

      hideLoading();
      return null;
    } catch (error) {
      hideLoading();
      console.error('❌ 최신 스토리 불러오기 오류:', error);
      return null;
    }
  },

  // 최신 스토리 ID만 가져오기
  async getLatestStoryId() {
    try {
      const url = `${CONFIG.GOOGLE_APPS_SCRIPT_URL}?action=latest`;
      const response = await fetch(url);

      if (!response.ok) throw new Error('서버 응답 오류');

      const result = await response.json();

      if (result.status === 'success' && result.data) {
        return result.data.storyId;
      }
      return null;
    } catch (error) {
      console.error('❌ 최신 스토리 ID 가져오기 오류:', error);
      return null;
    }
  }
};

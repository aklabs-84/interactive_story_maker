import { CONFIG } from '../constants/config';

class ApiService {
  /**
   * 스토리를 스프레드시트에 저장
   */
  async saveStory(story) {
    try {
      const data = {
        action: 'save',
        storyId: story.id,
        timestamp: new Date().toISOString(),
        title: story.metadata.title,
        author: story.metadata.author || '익명',
        description: story.metadata.description || '',
        theme: story.metadata.theme,
        ownerId: story.metadata.ownerId || '',
        storyData: JSON.stringify(story)
      };

      await fetch(CONFIG.GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        mode: 'no-cors'
      });

      console.log('✅ 스프레드시트 저장 요청 완료');
      return true;
    } catch (error) {
      console.error('❌ 스프레드시트 저장 오류:', error);
      return false;
    }
  }

  /**
   * 특정 스토리 불러오기
   */
  async loadStory(storyId) {
    try {
      const url = `${CONFIG.GOOGLE_APPS_SCRIPT_URL}?action=load&storyId=${encodeURIComponent(storyId)}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error('서버 응답 오류');

      const result = await response.json();

      if (result.status === 'success' && result.data) {
        if (result.data.storyJson) {
          return JSON.parse(result.data.storyJson);
        }

        if (result.data.fileUrl) {
          const jsonResponse = await fetch(result.data.fileUrl);
          if (!jsonResponse.ok) throw new Error('JSON 파일 다운로드 실패');
          return await jsonResponse.json();
        }
      }
      return null;
    } catch (error) {
      console.error('❌ 스토리 불러오기 오류:', error);
      return null;
    }
  }

  /**
   * 최신 스토리 정보 가져오기
   */
  async getLatestStory() {
    try {
      const url = `${CONFIG.GOOGLE_APPS_SCRIPT_URL}?action=latest`;
      const response = await fetch(url);

      if (!response.ok) throw new Error('서버 응답 오류');

      const result = await response.json();

      if (result.status === 'success' && result.data) {
        if (result.data.storyJson) {
          return {
            story: JSON.parse(result.data.storyJson),
            storyId: result.data.storyId
          };
        }
      }
      return null;
    } catch (error) {
      console.error('❌ 최신 스토리 가져오기 오류:', error);
      return null;
    }
  }
}

export const apiService = new ApiService();

/**
 * 이미지 처리 유틸리티 - 크기 조정, 압축 및 Base64 변환
 */

export const imageHandler = {
  /**
   * 이미지를 처리하여 Base64 문자열로 반환
   */
  async processImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // 가로세로 비율 유지하며 크기 조정
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // 압축된 Base64 데이터 생성
          const base64Data = canvas.toDataURL('image/jpeg', quality);
          
          console.log(`[이미지] 처리 완료: ${file.name} (${Math.round(base64Data.length / 1024)} KB)`);
          resolve(base64Data);
        };

        img.onerror = () => reject(new Error('이미지 로드 실패'));
        img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error('파일 읽기 실패'));
      reader.readAsDataURL(file);
    });
  }
};

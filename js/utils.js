// ==========================================
// 유틸리티 모듈
// ==========================================

// 토스트 메시지 표시 (세로 스택 방식)
function showToast(message, type = 'default', duration = 3000) {
  // 토스트 컨테이너 생성 (없을 경우)
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }

  // 토스트 생성
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    pointer-events: auto;
    opacity: 0;
    transform: translateX(100px);
    transition: all 0.3s ease-in-out;
  `;

  // 컨테이너에 추가
  toastContainer.appendChild(toast);

  // 애니메이션 시작 (다음 프레임에)
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  });

  // 제거 애니메이션
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';

    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }

      // 컨테이너가 비어있으면 제거
      if (toastContainer.children.length === 0) {
        toastContainer.remove();
      }
    }, 300); // 애니메이션 시간과 일치
  }, duration);
}

// 로딩 오버레이 표시
function showLoading(message = '로딩 중...') {
  let overlay = document.getElementById('loadingOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div class="text-center">
        <div class="loading-spinner mb-4 mx-auto" style="width: 50px; height: 50px; border-width: 4px;"></div>
        <p id="loadingText" class="text-lg">${message}</p>
      </div>
    `;
    document.body.appendChild(overlay);
  }
  
  const text = document.getElementById('loadingText');
  if (text) text.textContent = message;
  overlay.classList.add('active');
}

// 로딩 오버레이 숨기기
function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.classList.remove('active');
}

// URL 파라미터 가져오기
function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// 현재 날짜 포맷
function formatDate(date = new Date()) {
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// 공유 URL 생성
function generateShareUrl(storyId) {
  const baseUrl = CONFIG.WEB_APP_BASE_URL.replace(/\/$/, '');
  return `${baseUrl}/player.html?story=${encodeURIComponent(storyId)}`;
}

// 클립보드 복사
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  }
}

// 이미지를 Base64로 변환하여 반환 (localStorage에 저장용)
async function uploadImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const imageData = e.target.result; // Base64 데이터

        console.log('📤 이미지 처리 완료:', file.name);
        console.log('📊 이미지 크기:', Math.round(imageData.length / 1024), 'KB');

        // Base64 데이터를 그대로 반환 (localStorage에 저장됨)
        resolve(imageData);
      } catch (err) {
        console.error('❌ 이미지 처리 오류:', err);
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(new Error('파일 읽기 실패'));
    };

    reader.readAsDataURL(file);
  });
}

// 이미지 크기 조정 및 압축
async function resizeAndCompressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 비율 유지하면서 크기 조정
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

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              reject(new Error('이미지 압축 실패'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('이미지 로드 실패'));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error('파일 읽기 실패'));
    };

    reader.readAsDataURL(file);
  });
}
// ==========================================
// 인터랙티브 스토리 메이커 - Google Apps Script (이미지 업로드 포함)
// ==========================================
// 이 코드를 Google Apps Script 에디터에 붙여넣으세요.
// ==========================================

// ⚠️ 설정: 스프레드시트 ID와 드라이브 폴더 ID를 입력하세요
const SPREADSHEET_ID = '1PezTZ3hDuepfQjy9vwjdZWl0VSWv02c6MIYVQua-0sw';
const STORY_FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID'; // 스토리 JSON 파일을 저장할 구글 드라이브 폴더 ID

// 이미지 최대 크기 (2MB) - 더 이상 사용 안함
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

// ==========================================
// POST 요청 처리 (스토리 저장)
// ==========================================
function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // POST 데이터 파싱
    let data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        Logger.log('JSON parse error: ' + parseErr);
        data = e.parameter || {};
      }
    } else {
      data = e ? (e.parameter || {}) : {};
    }

    Logger.log('Received data action: ' + data.action);

    // 스토리 저장 처리
    if (data.action === 'save') {
      return saveStory(ss, data);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: '알 수 없는 액션입니다.' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('Error in doPost: ' + err);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// 스토리 저장 처리 (Drive에 JSON 파일 + 스프레드시트에 메타데이터)
// ==========================================
function saveStory(ss, data) {
  try {
    const storyJsonString = data.storyData || '';
    const storyId = data.storyId || '';
    const title = data.title || 'Untitled';
    let fileUrl = '';

    // 1. Drive에 JSON 파일 저장 (STORY_FOLDER_ID가 설정된 경우에만)
    if (STORY_FOLDER_ID && STORY_FOLDER_ID !== 'YOUR_DRIVE_FOLDER_ID') {
      try {
        // 파일명 생성 (안전한 파일명)
        const safeTitle = title.replace(/[^a-zA-Z0-9가-힣\s]/g, '').replace(/\s+/g, '_');
        const timestamp = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyyMMdd_HHmmss');
        const fileName = `${safeTitle}_${storyId}_${timestamp}.json`;

        // Drive 폴더 가져오기
        const folder = DriveApp.getFolderById(STORY_FOLDER_ID);

        // 기존 파일 찾기 (같은 storyId)
        const existingFiles = folder.getFilesByName(fileName);
        let file;

        if (existingFiles.hasNext()) {
          // 기존 파일 업데이트
          file = existingFiles.next();
          file.setContent(storyJsonString);
          Logger.log('Story file updated: ' + fileName);
        } else {
          // 새 파일 생성
          file = folder.createFile(fileName, storyJsonString, 'application/json');
          Logger.log('New story file created: ' + fileName);
        }

        // 파일 공유 설정 (누구나 링크로 접근 가능)
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

        // 파일 URL 생성
        const fileId = file.getId();
        fileUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      } catch (driveErr) {
        Logger.log('Drive 저장 실패 (스프레드시트에는 저장됨): ' + driveErr);
      }
    } else {
      Logger.log('STORY_FOLDER_ID가 설정되지 않음 - Drive 저장 건너뜀');
    }

    // 2. 스프레드시트에 메타데이터 저장
    const today = new Date();
    const sheetName = Utilities.formatDate(today, 'Asia/Seoul', 'yyyy-MM-dd');

    // 시트 가져오기 또는 생성
    let sh = ss.getSheetByName(sheetName);
    if (!sh) {
      sh = ss.insertSheet(sheetName);

      // 헤더 설정
      sh.getRange(1, 1, 1, 7).setValues([[
        '저장시간', '스토리ID', '제목', '작성자', '설명', '테마', 'Drive파일URL'
      ]]);

      // 헤더 스타일링
      const headerRange = sh.getRange(1, 1, 1, 7);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
      headerRange.setHorizontalAlignment('center');

      // 열 너비 설정
      sh.setColumnWidth(1, 150);  // 저장시간
      sh.setColumnWidth(2, 200);  // 스토리ID
      sh.setColumnWidth(3, 200);  // 제목
      sh.setColumnWidth(4, 100);  // 작성자
      sh.setColumnWidth(5, 300);  // 설명
      sh.setColumnWidth(6, 100);  // 테마
      sh.setColumnWidth(7, 400);  // Drive파일URL
    }

    // 기존 스토리 찾기 (동일 ID 업데이트)
    const dataRange = sh.getDataRange();
    const values = dataRange.getValues();
    let existingRow = -1;

    for (let i = 1; i < values.length; i++) {
      if (values[i][1] === storyId) {
        existingRow = i + 1;
        break;
      }
    }

    const rowData = [
      data.timestamp || new Date().toLocaleString('ko-KR'),
      storyId,
      title,
      data.author || '익명',
      data.description || '',
      data.theme || '',
      fileUrl
    ];

    if (existingRow > 0) {
      // 기존 행 업데이트
      const range = sh.getRange(existingRow, 1, 1, 7);
      range.setValues([rowData]);
      Logger.log('Spreadsheet row updated: ' + existingRow);
    } else {
      // 새 행 추가
      sh.appendRow(rowData);
      Logger.log('New spreadsheet row added');
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: '저장 완료!',
        fileUrl: fileUrl
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('Error in saveStory: ' + err);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// GET 요청 처리 (스토리 조회)
// ==========================================
function doGet(e) {
  try {
    const action = e.parameter.action;
    const storyId = e.parameter.storyId;

    Logger.log('GET - action: ' + action + ', storyId: ' + storyId);

    if (action === 'load' && storyId) {
      return loadStory(storyId);
    } else if (action === 'latest') {
      return loadLatestStory();
    } else {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: 'success',
          message: 'Interactive Story Maker API is working!'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

  } catch (err) {
    Logger.log('Error in doGet: ' + err);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// 특정 스토리 불러오기 (Drive URL 반환)
// ==========================================
function loadStory(storyId) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = ss.getSheets();

    // 모든 시트에서 검색 (최신 시트부터)
    for (let i = sheets.length - 1; i >= 0; i--) {
      const sheet = sheets[i];
      const sheetName = sheet.getName();

      // 날짜 형식 시트만 검색
      if (!/^\d{4}-\d{2}-\d{2}$/.test(sheetName)) continue;

      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();

      for (let row = 1; row < values.length; row++) {
        if (values[row][1] === storyId) {
          const storyData = {
            timestamp: values[row][0],
            storyId: values[row][1],
            title: values[row][2],
            author: values[row][3],
            description: values[row][4],
            theme: values[row][5],
            fileUrl: values[row][6]  // Drive 파일 URL
          };

          Logger.log('Story found: ' + storyId);

          return ContentService
            .createTextOutput(JSON.stringify({ status: 'success', data: storyData }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    Logger.log('Story not found: ' + storyId);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: '스토리를 찾을 수 없습니다.' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('Error in loadStory: ' + err);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// 최신 스토리 불러오기 (Drive URL 반환)
// ==========================================
function loadLatestStory() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = ss.getSheets();

    // 날짜 형식 시트만 필터링하고 최신순 정렬
    const dateSheets = sheets
      .filter(sheet => /^\d{4}-\d{2}-\d{2}$/.test(sheet.getName()))
      .sort((a, b) => b.getName().localeCompare(a.getName()));

    if (dateSheets.length === 0) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'error', message: '저장된 스토리가 없습니다.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 최신 시트에서 마지막 데이터 가져오기
    for (const sheet of dateSheets) {
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();

      if (values.length > 1) {
        const lastRow = values[values.length - 1];

        const storyData = {
          timestamp: lastRow[0],
          storyId: lastRow[1],
          title: lastRow[2],
          author: lastRow[3],
          description: lastRow[4],
          theme: lastRow[5],
          fileUrl: lastRow[6]  // Drive 파일 URL
        };

        Logger.log('Latest story found: ' + storyData.storyId);

        return ContentService
          .createTextOutput(JSON.stringify({ status: 'success', data: storyData }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: '저장된 스토리가 없습니다.' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('Error in loadLatestStory: ' + err);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// OPTIONS 요청 (CORS)
// ==========================================
function doOptions() {
  return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 테스트 함수
// ==========================================
function testFunction() {
  Logger.log('Test function executed');
  Logger.log('Spreadsheet ID: ' + SPREADSHEET_ID);
  Logger.log('Story Folder ID: ' + STORY_FOLDER_ID);

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('Spreadsheet name: ' + ss.getName());
    Logger.log('Sheets count: ' + ss.getSheets().length);

    const folder = DriveApp.getFolderById(STORY_FOLDER_ID);
    Logger.log('Story folder name: ' + folder.getName());
  } catch (err) {
    Logger.log('Error: ' + err);
  }
}

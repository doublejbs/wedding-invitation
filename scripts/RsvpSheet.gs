// 참석 여부(Rsvp.html)를 구글 시트에 한 줄씩 기록하는 Apps Script 웹 앱.
// 배포 방법
// 1. 구글 시트를 새로 만들고 메뉴에서 확장 프로그램 → Apps Script를 연다.
// 2. 기본 코드를 지우고 이 파일 내용을 그대로 붙여 넣은 뒤 저장한다.
// 3. 배포 → 새 배포 → 유형 "웹 앱", 실행 계정 "나", 액세스 권한 "모든 사용자"로 배포하고 권한을 허용한다.
// 4. 나온 웹 앱 URL(…/exec)을 docs/cover-studies/Rsvp.html 의 RSVP_ENDPOINT 에 넣는다.
// 코드를 고친 뒤에는 배포 관리에서 같은 배포의 버전을 새로 올려야 반영된다(URL은 그대로).
// 같은 기기(deviceId)에서 같은 이름으로 다시 보내면 그 줄을 덮어쓴다. 이름이 다르면 새 줄을 쓴다
// (한 휴대폰으로 두 사람이 보내도 앞사람 줄이 지워지지 않게).
// 열 구성을 바꿨다면 기존 '참석 여부' 시트의 머리 줄도 HEADERS에 맞게 고치거나 시트를 새로 만든다.

const SHEET_NAME = '참석 여부';
const HEADERS = ['받은 시각', '보낸 시각', '신랑측/신부측', '참석', '이름', '인원', '식사', 'deviceId'];
const NAME_COLUMN = HEADERS.indexOf('이름') + 1;
const DEVICE_ID_COLUMN = HEADERS.indexOf('deviceId') + 1;
const LOCK_WAIT_MS = 10000;
const MAX_TEXT_LENGTH = 100;
// Same limits as MIN_GUESTS / MAX_GUESTS in docs/cover-studies/Rsvp.html.
const MIN_GUESTS = 1;
const MAX_GUESTS = 9;

const SIDE_LABELS = { groom: '신랑측', bride: '신부측' };
const ATTENDANCE_LABELS = { attend: '참석', absent: '마음만' };
const MEAL_LABELS = { yes: '식사', no: '안 함' };

// Trimmed, inner runs of whitespace folded to one space (the client sends names the same way).
const normalizeText = (value) => {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
};

// The sheet is shared with the couple, so values are kept short and never start like a formula.
const cleanText = (value) => {
  const text = normalizeText(value).slice(0, MAX_TEXT_LENGTH);

  return /^[=+\-@]/.test(text) ? `'${text}` : text;
};

// The comparable form of a stored or incoming name: the formula guard's leading quote is not part of it.
const toNameKey = (value) => {
  return normalizeText(value).replace(/^'/, '');
};

const getSheet = () => {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) ?? spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
};

const toRow = (payload) => {
  const isAttending = payload.attendance === 'attend';
  const guests = Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, Number(payload.guests) || MIN_GUESTS));
  const receivedAt = new Date();
  const sentAt = new Date(payload.sentAt);

  return [
    receivedAt,
    Number.isNaN(sentAt.getTime()) ? receivedAt : sentAt,
    SIDE_LABELS[payload.side] ?? '',
    ATTENDANCE_LABELS[payload.attendance] ?? '',
    cleanText(payload.name),
    isAttending ? guests : '',
    isAttending ? MEAL_LABELS[payload.meal] ?? '' : '',
    cleanText(payload.deviceId),
  ];
};

// Returns the 1-based sheet row holding the earlier answer from this device under this name, or 0.
const findAnswerRow = (sheet, deviceId, name) => {
  const lastRow = sheet.getLastRow();

  if (!deviceId || lastRow < 2) {
    return 0;
  }

  const firstColumn = Math.min(NAME_COLUMN, DEVICE_ID_COLUMN);
  const width = Math.max(NAME_COLUMN, DEVICE_ID_COLUMN) - firstColumn + 1;
  const rows = sheet.getRange(2, firstColumn, lastRow - 1, width).getValues();
  const nameKey = toNameKey(name);
  const index = rows.findIndex((cells) => {
    const isSameDevice = String(cells[DEVICE_ID_COLUMN - firstColumn]) === deviceId;

    return isSameDevice && toNameKey(cells[NAME_COLUMN - firstColumn]) === nameKey;
  });

  return index === -1 ? 0 : index + 2;
};

const respond = (body) => {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
};

// Exception to the arrow-function rule: Apps Script finds web app entry points (doPost) by scanning
// for function declarations; a const arrow function is not reliably picked up as the doPost handler.
function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    const payload = JSON.parse(e && e.postData ? e.postData.contents : '{}');

    // A name of spaces only is no name.
    if (!normalizeText(payload.name) || !SIDE_LABELS[payload.side] || !ATTENDANCE_LABELS[payload.attendance]) {
      return respond({ ok: false, error: 'invalid' });
    }

    // Two guests sending at once must not both append, or overwrite each other's row.
    lock.waitLock(LOCK_WAIT_MS);

    const sheet = getSheet();
    const row = toRow(payload);
    const existingRow = findAnswerRow(sheet, row[DEVICE_ID_COLUMN - 1], row[NAME_COLUMN - 1]);

    if (existingRow) {
      sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    return respond({ ok: true });
  } catch (error) {
    return respond({ ok: false, error: String(error) });
  } finally {
    lock.releaseLock();
  }
}

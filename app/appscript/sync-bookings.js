const PROJECT_ID = 'badmintoncourts-28a16';
const COLLECTION_NAME = 'bookings';
const CACHE_KEY = 'LAST_SYNC_TIME';

function getFirestoreDataAndWriteToSheet() {
  const cache = CacheService.getScriptCache();
  const lastSyncTime = cache.get(CACHE_KEY) || '1970-01-01T00:00:00Z';
  const currentTime = new Date().toISOString();

  // Only fetch documents that were created/modified since last sync
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION_NAME}?pageSize=100&orderBy=updateTime&filter=updateTime > "${lastSyncTime}"`;

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const response = UrlFetchApp.fetch(url, {
      method: "GET",
      contentType: "application/json",
      muteHttpExceptions: true
    });

    if (response.getResponseCode() !== 200) {
      Logger.log(`HTTP Error: ${response.getResponseCode()} - ${response.getContentText()}`);
      return;
    }

    const text = response.getContentText();
    const json = JSON.parse(text);
    const documents = json.documents || [];

    if (documents.length === 0) {
      Logger.log("Không có dữ liệu mới từ Firestore.");
      cache.put(CACHE_KEY, currentTime, 21600); // Cache for 6 hours
      return;
    }

    Logger.log(`Đã lấy ${documents.length} documents mới từ Firestore.`);

    // Initialize sheet if empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "fullName", "phone", "email", "date",
        "startTime", "endTime", "duration",
        "courtName", "totalPrice", "docId", 
        "Trạng thái gửi", "Thời gian cập nhật"
      ]);
    }

    // Load existing data into memory for faster lookup
    const data = sheet.getDataRange().getValues();
    const docIdToRow = new Map();
    for (let i = 1; i < data.length; i++) {
      docIdToRow.set(data[i][9], i + 1); // docId is column 10 (index 9)
    }

    // Batch process documents
    const batchSize = 10;
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      processBatch(batch, sheet, docIdToRow);
      
      // Add small delay between batches to avoid rate limits
      if (i + batchSize < documents.length) {
        Utilities.sleep(1000);
      }
    }

    // Update last sync time
    cache.put(CACHE_KEY, currentTime, 21600); // Cache for 6 hours
    Logger.log(`Sync completed successfully. Next sync will start from: ${currentTime}`);

  } catch (error) {
    Logger.log("Lỗi khi lấy dữ liệu Firestore: " + error);
  }
}

function processBatch(documents, sheet, docIdToRow) {
  documents.forEach(doc => {
    const fields = doc.fields;
    if (!fields) return;

    const docId = doc.name.split('/').pop();
    const rowIndex = docIdToRow.get(docId);

    const get = (key, type = 'stringValue') => {
      if (!fields[key]) return "";
      const value = fields[key][type] || "";
      if (key === "duration" && value !== "") return parseInt(value, 10);
      return value;
    };

    const bookingData = {
      fullName: get("fullName"),
      phone: get("phone"),
      email: get("email"),
      date: get("date"),
      startTime: get("startTime"),
      endTime: get("endTime"),
      duration: get("duration", "integerValue") || 0,
      courtName: get("courtName"),
      totalPrice: get("totalPrice", "integerValue"),
      docId: docId,
      updateTime: doc.updateTime
    };

    if (rowIndex) {
      const status = sheet.getRange(rowIndex, 11).getValue();
      if (status !== "Đã gửi") {
        trySendEmail(bookingData, sheet, rowIndex);
      }
    } else {
      // Add new row
      const newRow = [
        bookingData.fullName,
        bookingData.phone,
        bookingData.email,
        bookingData.date,
        bookingData.startTime,
        bookingData.endTime,
        bookingData.duration,
        bookingData.courtName,
        bookingData.totalPrice,
        bookingData.docId,
        "Chưa gửi",
        bookingData.updateTime
      ];
      sheet.appendRow(newRow);
      const lastRow = sheet.getLastRow();
      trySendEmail(bookingData, sheet, lastRow);
    }
  });
}

function trySendEmail(data, sheet, rowIndex) {
  try {
    sendMail(data);
    sheet.getRange(rowIndex, 11).setValue("Đã gửi");
    Logger.log(`Đã gửi email cho ${data.email}`);
  } catch (error) {
    Logger.log(`Lỗi gửi email: ${data.email} - ${error}`);
    sheet.getRange(rowIndex, 11).setValue("Lỗi gửi");
  }
}

function sendMail(data) {
  MailApp.sendEmail({
    to: data.email,
    subject: `Đặt sân thành công - ${data.courtName} ngày ${data.date}`,
    htmlBody: `
      <p>Chào ${data.fullName},</p>
      <p>Bạn đã đặt thành công sân <b>${data.courtName}</b> vào ngày <b>${data.date}</b>, 
      từ <b>${data.startTime}</b> đến <b>${data.endTime}</b>.</p>
      <p><b>Tổng tiền: ${Number(data.totalPrice).toLocaleString('vi-VN')} VND</b></p>
      <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
      <p>📞 Nếu cần hỗ trợ, vui lòng liên hệ: 0393118322</p>
    `
  });
}

function createTimeTrigger() {
  // Delete any existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Create new trigger to run every 5 minutes
  ScriptApp.newTrigger("getFirestoreDataAndWriteToSheet")
    .timeBased()
    .everyMinutes(5)
    .create();
  
  Logger.log("New trigger created successfully");
} 
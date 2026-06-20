// =============================================
// SHINRA 求人応募フォーム受信スクリプト
// Google Apps Script にコピーして使用してください
// =============================================

// ▼ ここを自分のメールアドレスに変更してください
const NOTIFY_EMAIL = 'shinra.hamamatsu.0101@gmail.com';

// ▼ 写真を保存するGoogleドライブのフォルダID
// フォルダを作成してURLの末尾のIDをコピーしてください
// 例: https://drive.google.com/drive/folders/XXXXXXXXXXXX → XXXXXXXXXXXXがID
const FOLDER_ID = 'ここにGoogleドライブのフォルダIDを入力';

function doPost(e) {
  try {
    const params = e.parameter;
    const applyType = params.apply_type || 'コンパニオン';
    const name     = params.name || '';
    const furigana = params.furigana || '';
    const tel      = params.tel || '';
    const email    = params.email || '';
    const address  = params.address || '';
    const age      = params.age || '';
    const idType   = params.id_type || '';
    const message  = params.message || '';

    // 写真ファイルの処理
    let photoUrl = '（写真なし）';
    if (e.postData && e.postData.contents) {
      // multipart の場合は files から取得
    }
    if (e.files && e.files['photo']) {
      const file     = e.files['photo'];
      const blob     = file.getBlob();
      const folder   = DriveApp.getFolderById(FOLDER_ID);
      const saved    = folder.createFile(blob.setName(`${name}_${new Date().getTime()}.jpg`));
      saved.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      photoUrl = saved.getUrl();
    }

    // 種別別の追加情報
    let extra = '';
    if (applyType === 'コンパニオン') {
      extra = `
経験: ${params.experience || ''}
飲酒: ${params.drink || ''}
連絡希望: ${params.contact_method || ''}`;
    } else {
      extra = `
ドライバー経験: ${params.driver_exp || ''}
所有車種: ${params.car || ''}
連絡希望: ${params.contact_method || ''}`;
    }

    // メール本文
    const body = `
【SHINRA 求人応募】${applyType}

■ 氏名: ${name}（${furigana}）
■ 電話: ${tel}
■ メール: ${email}
■ 住所: ${address}
■ 年齢: ${age}
■ 身分証: ${idType}
${extra}
■ 顔写真: ${photoUrl}
■ その他: ${message}

-------------------------------
送信日時: ${new Date().toLocaleString('ja-JP')}
`;

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: `【SHINRA求人】${applyType}応募：${name}`,
      body: body,
    });

    // 成功レスポンス（リダイレクト）
    return HtmlService.createHtmlOutput(`
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="refresh" content="0;url=https://shinra0101.com/recruit/?thanks=1">
      </head>
      <body>送信完了しました。リダイレクト中...</body>
      </html>
    `);

  } catch (err) {
    return HtmlService.createHtmlOutput('エラーが発生しました: ' + err.message);
  }
}

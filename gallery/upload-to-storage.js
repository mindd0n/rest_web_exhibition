const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// **중요**: 이 부분은 사용자의 Firebase 프로젝트에 맞게 수정해야 합니다.
// 1. Firebase 콘솔에서 서비스 계정 키를 다운로드하여 `serviceAccountKey.json`으로 저장하세요.
// 2. `storageBucket`을 사용자의 Firebase Storage 버킷 URL로 바꾸세요.
const serviceAccount = require('./serviceAccountKey.json');
const BUCKET_NAME = 'rest-web-exhibition.firebasestorage.app'; // 예: 'my-cool-project.appspot.com'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: BUCKET_NAME,
});

const bucket = admin.storage().bucket();
const sourceDir = path.join(__dirname, 'public', 'content');

async function uploadFile(filePath) {
  const destination = path.relative(path.join(__dirname, 'public'), filePath).replace(/\\/g, '/');
  
  try {
    const [file] = await bucket.upload(filePath, {
      destination: destination,
      public: true, // 파일을 공개로 설정
      metadata: {
        // 모든 사용자에게 읽기 권한을 부여합니다.
        cacheControl: 'public, max-age=31536000',
      },
    });
    console.log(`${filePath} uploaded to ${destination}`);
    // 공개 URL 출력
    console.log(`Public URL: ${file.publicUrl()}`);
  } catch (error) {
    console.error(`Error uploading ${filePath}:`, error);
  }
}

async function uploadDirectory(directory) {
  const items = fs.readdirSync(directory);
  for (const item of items) {
    const fullPath = path.join(directory, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      // node_modules 폴더는 업로드에서 제외합니다.
      if (path.basename(fullPath) !== 'node_modules') {
        await uploadDirectory(fullPath);
      }
    } else {
      // meta.json 파일은 업로드에서 제외합니다.
      if (path.basename(fullPath) !== 'meta.json') {
          await uploadFile(fullPath);
      }
    }
  }
}

(async () => {
    if (!fs.existsSync(path.join(__dirname, 'serviceAccountKey.json'))) {
        console.error('ERROR: `serviceAccountKey.json` 파일을 찾을 수 없습니다.');
        console.log('Firebase 콘솔에서 서비스 계정 키를 다운로드하여 `gallery/serviceAccountKey.json` 경로에 저장해주세요.');
        return;
    }
    if (BUCKET_NAME === 'your-project-id.appspot.com') {
        console.error('ERROR: `BUCKET_NAME`을 스크립트에서 수정해야 합니다.');
        console.log('Firebase Storage 버킷의 URL을 `upload-to-storage.js` 파일 안의 `BUCKET_NAME` 변수에 입력해주세요.');
        return;
    }
  console.log('Starting upload to Firebase Storage...');
  await uploadDirectory(sourceDir);
  console.log('Upload finished.');
})(); 
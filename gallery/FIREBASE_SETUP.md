# Firebase 설정 가이드

## 1. Firebase 프로젝트 생성

1. [Firebase 콘솔](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 및 설정 완료

## 2. 웹 앱 추가

1. 프로젝트 대시보드에서 "웹" 아이콘 클릭
2. 앱 닉네임 입력
3. "앱 등록" 클릭
4. Firebase SDK 설정 정보 복사

## 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

## 4. Firebase 서비스 활성화

### Firestore Database
1. Firebase 콘솔에서 "Firestore Database" 선택
2. "데이터베이스 만들기" 클릭
3. 보안 규칙 설정 (테스트 모드로 시작 가능)

### Storage
1. Firebase 콘솔에서 "Storage" 선택
2. "시작하기" 클릭
3. 보안 규칙 설정

### Authentication (선택사항)
1. Firebase 콘솔에서 "Authentication" 선택
2. "시작하기" 클릭
3. 원하는 로그인 방법 활성화

## 5. 사용 예시

### Firestore 사용
```javascript
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// 데이터 추가
const addData = async () => {
  await addDoc(collection(db, 'items'), {
    name: '새 항목',
    timestamp: new Date()
  });
};

// 데이터 가져오기
const getData = async () => {
  const querySnapshot = await getDocs(collection(db, 'items'));
  querySnapshot.forEach((doc) => {
    console.log(doc.id, doc.data());
  });
};
```

### Storage 사용
```javascript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

// 파일 업로드
const uploadFile = async (file) => {
  const storageRef = ref(storage, `files/${file.name}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};
```

### Authentication 사용
```javascript
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

// 로그인
const login = async (email, password) => {
  await signInWithEmailAndPassword(auth, email, password);
};

// 회원가입
const signup = async (email, password) => {
  await createUserWithEmailAndPassword(auth, email, password);
};
```

## 6. 보안 규칙 설정

### Firestore 보안 규칙 예시
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Storage 보안 규칙 예시
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 7. 배포 시 주의사항

- `.env` 파일은 `.gitignore`에 추가하여 Git에 커밋하지 마세요
- 프로덕션 환경에서는 적절한 보안 규칙을 설정하세요
- Firebase 프로젝트의 결제 계정을 설정하세요 (무료 할당량 초과 시)

## 8. 문제 해결

### 일반적인 오류
1. **API 키 오류**: 환경 변수가 올바르게 설정되었는지 확인
2. **권한 오류**: Firestore/Storage 보안 규칙 확인
3. **네트워크 오류**: 인터넷 연결 및 Firebase 프로젝트 상태 확인

### 디버깅
- 브라우저 개발자 도구의 콘솔에서 오류 메시지 확인
- Firebase 콘솔의 로그 섹션에서 서버 측 오류 확인

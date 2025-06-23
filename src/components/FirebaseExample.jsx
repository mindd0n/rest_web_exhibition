import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

const FirebaseExample = () => {
  const [data, setData] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [file, setFile] = useState(null);

  // 데이터 가져오기
  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'items'));
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setData(items);
    } catch (error) {
      console.error('데이터 가져오기 오류:', error);
    }
  };

  // 새 데이터 추가
  const addData = async () => {
    if (!newItem.trim()) return;
    
    try {
      await addDoc(collection(db, 'items'), {
        name: newItem,
        timestamp: new Date()
      });
      setNewItem('');
      fetchData();
    } catch (error) {
      console.error('데이터 추가 오류:', error);
    }
  };

  // 파일 업로드
  const uploadFile = async () => {
    if (!file) return;
    
    try {
      const storageRef = ref(storage, `files/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      console.log('파일 업로드 완료:', downloadURL);
    } catch (error) {
      console.error('파일 업로드 오류:', error);
    }
  };

  // 데이터 삭제
  const deleteData = async (id) => {
    try {
      await deleteDoc(doc(db, 'items', id));
      fetchData();
    } catch (error) {
      console.error('데이터 삭제 오류:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Firebase 예시</h2>
      
      {/* 데이터 추가 */}
      <div style={{ marginBottom: '20px' }}>
        <h3>새 데이터 추가</h3>
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="새 항목 입력"
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button onClick={addData} style={{ padding: '5px 10px' }}>
          추가
        </button>
      </div>

      {/* 파일 업로드 */}
      <div style={{ marginBottom: '20px' }}>
        <h3>파일 업로드</h3>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginRight: '10px' }}
        />
        <button onClick={uploadFile} style={{ padding: '5px 10px' }}>
          업로드
        </button>
      </div>

      {/* 데이터 목록 */}
      <div>
        <h3>데이터 목록</h3>
        {data.map((item) => (
          <div key={item.id} style={{ 
            border: '1px solid #ccc', 
            padding: '10px', 
            margin: '5px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>{item.name}</span>
            <button 
              onClick={() => deleteData(item.id)}
              style={{ padding: '2px 8px', backgroundColor: '#ff4444', color: 'white', border: 'none' }}
            >
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FirebaseExample;

document.addEventListener('DOMContentLoaded', () => {
    const introImage = document.getElementById('intro-image');
    const introImageMobile = document.getElementById('intro-image-mobile');
    const introVideo = document.getElementById('intro-video');
    const introVideoMobile = document.getElementById('intro-video-mobile');
    const playButton = document.getElementById('play-button');
    const enterButton = document.getElementById('enter-button');
    const testButton = document.getElementById('test-button');

    // 현재 디바이스에 맞는 요소 선택
    let currentImage = window.innerWidth <= 768 ? introImageMobile : introImage;
    let currentVideo = window.innerWidth <= 768 ? introVideoMobile : introVideo;

    // 이미지 로드 완료 시 play 버튼 표시
    currentImage.onload = () => {
        playButton.style.opacity = '1';
    };

    // 비디오 시간 업데이트 이벤트 핸들러
    const handleTimeUpdate = (video) => {
        const remainingTime = video.duration - video.currentTime;
        if (remainingTime <= 15.73) {
            enterButton.classList.remove('hidden');
        }
    };

    // PC와 모바일 비디오 모두에 timeupdate 이벤트 리스너 등록
    introVideo.addEventListener('timeupdate', () => handleTimeUpdate(introVideo));
    introVideoMobile.addEventListener('timeupdate', () => handleTimeUpdate(introVideoMobile));

    // 재생 버튼 클릭 시
    playButton.addEventListener('click', async () => {
        try {
            // 이미지 페이드 아웃
            currentImage.style.opacity = '0';
            
            // 비디오 준비
            currentVideo.classList.remove('hidden');
            currentVideo.style.opacity = '0';
            
            // 버튼 숨기기
            playButton.classList.add('hidden');
            
            // 비디오 페이드 인
            setTimeout(async () => {
                currentImage.classList.add('hidden');
                currentVideo.style.opacity = '1';
                
                try {
                    await currentVideo.play();
                } catch (error) {
                    console.error('Video play failed:', error);
                    // 재생 실패 시 다시 시도
                    currentVideo.muted = true;
                    await currentVideo.play();
                }
            }, 500);
        } catch (error) {
            console.error('Error during video transition:', error);
        }
    });

    // 비디오 종료 시
    currentVideo.addEventListener('ended', () => {
        // 여기에 전시장 입장 로직 추가
        console.log('전시장 입장');
    });

    // 입장 버튼 클릭 시
    enterButton.addEventListener('click', () => {
        // 여기에 전시장 입장 로직 추가
        console.log('전시장 입장');
    });

    // 테스트 버튼 클릭 시
    testButton.addEventListener('click', () => {
        if (currentVideo.duration) {
            currentVideo.currentTime = currentVideo.duration - 17;
        }
    });

    // 화면 크기 변경 시
    window.addEventListener('resize', () => {
        const newImage = window.innerWidth <= 768 ? introImageMobile : introImage;
        const newVideo = window.innerWidth <= 768 ? introVideoMobile : introVideo;
        
        if (newImage !== currentImage) {
            currentImage.classList.add('hidden');
            newImage.classList.remove('hidden');
            newImage.style.opacity = '1';
            
            // 현재 요소 업데이트
            currentImage = newImage;
            currentVideo = newVideo;
        }
    });
}); 
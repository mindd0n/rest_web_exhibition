import React, { useState } from 'react';

const RightBottomControls = () => {
    const [isMusicOn, setIsMusicOn] = useState(true);

    const toggleMusic = () => {
        setIsMusicOn(!isMusicOn);
        // Add music play/pause logic here
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            display: 'flex',
            gap: '10px',
            zIndex: 100,
        }}>
            <button 
                onClick={toggleMusic}
                style={{
                    width: '50px',
                    height: '50px',
                    border: 'none',
                    background: `url(${isMusicOn ? '/images/buttons/music-on.png' : '/images/buttons/music-off.png'})`,
                    backgroundSize: 'cover',
                    cursor: 'pointer',
                }}
            />
            <button
                onClick={() => window.location.href = 'https://www.instagram.com/your_instagram'}
                style={{
                    width: '50px',
                    height: '50px',
                    border: 'none',
                    background: `url('/images/buttons/icon_out.png')`,
                    backgroundSize: 'cover',
                    cursor: 'pointer',
                }}
                onMouseOver={e => e.currentTarget.style.background = `url('/images/buttons/icon_out_hover.png')`}
                onMouseOut={e => e.currentTarget.style.background = `url('/images/buttons/icon_out.png')`}
            />
        </div>
    );
};

export default RightBottomControls; 
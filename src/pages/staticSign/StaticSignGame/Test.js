import React from 'react';
import Webcam from 'react-webcam';

function Test({ webcamRef, canvasRef }) {
  return (
    <div style={{ position: 'relative', width: '100%', paddingTop: '75%', borderRadius: '12px', overflow: 'hidden', background: '#0f172a' }}>
      <Webcam
        ref={webcamRef}
        mirrored
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default Test;

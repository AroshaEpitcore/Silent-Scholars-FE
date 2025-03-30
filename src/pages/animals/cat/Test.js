import { Hands } from '@mediapipe/hands';
import React, { useRef, useEffect, useState } from 'react';
import * as hands from '@mediapipe/hands';
import * as cam from '@mediapipe/camera_utils';
import Webcam from 'react-webcam';
import axios from 'axios';
function Test({ webcamRef, canvasRef }) {
    // =========================================

    return (
        <center>
            <div>
                <Webcam
                    ref={webcamRef}
                    style={{
                        position: 'absolute',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        right: -50,
                        textAlign: 'left',
                        zindex: 9,
                        width: 500,
                        height: 400,
                        top:-200
                    }}
                />
                <canvas
                    ref={canvasRef}
                    className="output_canvas"
                    style={{
                        position: 'absolute',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        right: -50,
                        textAlign: 'left',
                        zindex: 9,
                        width: 500,
                        height: 400,
                        top:-200
                    }}
                ></canvas>
            </div>
        </center>
    );
}

export default Test;

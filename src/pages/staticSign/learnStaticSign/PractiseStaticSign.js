import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import { useRef } from "react";
import * as hands from "@mediapipe/hands";
import * as cam from "@mediapipe/camera_utils";
import { Hands } from "@mediapipe/hands";
import axios from "axios";
import { Image } from 'antd';
import 'antd/dist/antd.css';
import { SmileOutlined, SendOutlined, PlayCircleOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Button, Result, PageHeader } from 'antd';
import { Col, Row } from 'antd';
import Test from './Test';
import { StaticSignData } from '../../../Data/StaticSignData';
import { useNavigate, useParams } from "react-router-dom";

let time = 0;
let landmarks = null;

export default function PracticeStaticSign() {

  // navigate to learn static sign page
  let navigate = useNavigate();
  const routeLearn = () => {
    let path = `/learn-static-sign`;
    navigate(path);
  }

 


  const [predictData, setPredictData] = useState([]);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const connect = window.drawConnectors;
  var camera = null;
  const [learn, setLearn] = useState(true);
  const [practice, setPractice] = useState(false);
  const [result, setResult] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [cameraData, setCameraData] = useState(null);
  const [SignData, setSignData] = useState(StaticSignData);

  const [landmarkClass, setLandmarkClass] = useState("none");
  const [probability, setProbability] = useState(0);
  //use state for current step
  const [currentStep, setCurrentStep] = React.useState(0);

  //use params
  const { id } = useParams();

  //on click start learning
  const onClickStart = () => {
    setLearn(false);
    setPractice(true);
    startDetection();
  };

  async function onResults(results) {
    // console.log(results)

    // const video = webcamRef.current.video;
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    // Set canvas width
    // land mark lines creation
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    let totalLandmarks = [];

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        connect(canvasCtx, landmarks, hands.HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 5
        });
        connect(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });

        await landmarks.map((item) => {
          totalLandmarks.push(item.x);
          totalLandmarks.push(item.y);
          totalLandmarks.push(item.z);
        });
      }
      const data = {
        // filename: 'test.csv',
        // className: 'Five'.toString(),
        temp: totalLandmarks
      };

      if (totalLandmarks.length === 63) {
        const result = await axios.post('http://127.0.0.1:5000/predict-static-sign', data);
        setLandmarkClass(result.data.predict);
        setProbability(result.data.probability);
      }
    }

    //extract hand landmarks

    canvasCtx.restore();
  }
  // }

  const startDetection = () => {
    // handleLeftDrawerToggle();
    setIsStarted(true);
    setIsCameraOn(true);
    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    hands.onResults(onResults);
    if (typeof webcamRef.current !== 'undefined' && webcamRef.current !== null) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          try {
            await hands.send({ image: webcamRef.current.video });
          } catch (error) { }
        },
        width: 640,
        height: 480
      });
      camera.start();
      setCameraData(camera);
    }
  };

  // ================================
  const stopDetection = () => {
    // camera.stop();
    cameraData.stop();
    setIsStarted(false);
    setIsCameraOn(false);
    routeLearn();
  };
  return (
    <>
      <PageHeader
        className="site-page-header"
        onBack={() => window.history.back()}
        title="Static Sign"
        subTitle="Learn a static sign"
        style={{ border: '1px solid rgb(235, 237, 240)' }}

      />
      <Row justify="center" align="middle" style={{ marginTop: '50px' }}>
        <Col span={8} align="center" justify="center">
          <Image
            width={300}
            src={SignData[id-1].alphabetImage}
          />
        </Col>
        <Col span={8} align="center" justify="center">
          {isCameraOn && <Test webcamRef={webcamRef} canvasRef={canvasRef} />} {/* open the camera */}

        </Col>
        <Col span={8} align="center" justify="center">
          {learn && (

            <Result
              icon={<PlayCircleOutlined />}
              title="Click Start to Practice!"
              extra={<Button type="primary" onClick={onClickStart}>Start</Button>}
            />

          )}
          {practice && probability > 0.7 &&  landmarkClass == SignData[id-1].name && ( //showing predicted result from back end
              <Result
                status="success"
                title="You are doing great!"
                subTitle="Keep practicing!"

              />
          )}
          {practice && probability < 0.7 &&  landmarkClass == SignData[id-1].name && (
              <Result
                status="warning"
                title="You need to practice more!"
                subTitle="Keep practicing!"
              />
          )}
          { landmarkClass !== SignData[id-1].name && !learn && (
            <Result
              status="error"
              title="Try again!"
              subTitle="You are not doing it right!"
            />
          )}
          {/* back to learning */}
          {!learn && (
          <Button type="primary" onClick={stopDetection}>Back to Learning</Button>
          )}


        </Col>
      </Row>
      {/* <Row style={{ marginTop: '80px' }}>
        <Col span={16} align="center" justify="center">
          <Button type="primary" shape="round" icon={<SendOutlined />} size={'large'} onClick={() => setCurrentStep(currentStep + 1)}>
            Learn Next Sign
          </Button>
        </Col>
      </Row> */}
    </>
  );
}

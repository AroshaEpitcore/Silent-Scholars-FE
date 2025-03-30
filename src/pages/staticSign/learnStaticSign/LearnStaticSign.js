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
import { useNavigate } from "react-router-dom";

let time = 0;
let landmarks = null;

export default function LearnStaticSign() {
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

  // use navigate
  let navigate = useNavigate();

  const routePractice = () => {
    let path = `/practise-static-sign/${SignData[currentStep].id}`;
    navigate(path);
  }

  //back to home
  const routeHome = () => {
    let path = `/static-sign-dashboard`;
    navigate(path);
  }

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
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    let totalLandmarks = [];

    if (results.multiHandLandmarks) {
      // console.log(results.multiHandLandmarks)
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
        // const result = await axios.post('http://127.0.0.1:5000/predict-test', data);
        console.log(result);
        setPredictData(result.data);
      }
      // console.log(totalLandmarks.length);
      // console.log(totalLandmarks);
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
      maxNumHands: 2,
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
    camera.stop();
    setIsStarted(false);
    setIsCameraOn(false);
  };
  return (
    <>
      <PageHeader
        className="site-page-header"
        onBack={() => routeHome()}
        title="Static Sign"
        subTitle="Learn a static sign"
        style={{ border: '1px solid rgb(235, 237, 240)' }}
      />
      <Row justify="center" align="middle" style={{ marginTop: '50px' }}>
        <Col span={8} align="center" justify="center">
          <Image
            width={400}
            src={SignData[currentStep].alphabetImage} //display the letter
          />
        </Col>
        <Col span={8} align="center" justify="center">
          <Image
            width={320}
            src={SignData[currentStep].signImage} //display the sign of the displayed letter
          />

        </Col>
        <Col span={8} align="center" justify="center">
          <Result
            icon={<PlayCircleOutlined />}
            title="Click Start to Practice this Sign"
            extra={<Button type="primary" onClick={routePractice}>Start</Button>}
          />

          {currentStep < SignData.length - 1 ? (
          <Button type="primary" danger shape="round" icon={<SendOutlined />} size={'large'} onClick={() => setCurrentStep(currentStep + 1)}>
            Learn Next Sign
          </Button>
        ) : (
          <Button type="primary" danger shape="round" icon={<SendOutlined />} size={'large'} onClick={routeHome}>
            Back to Home
          </Button>
        )}







        </Col>
      </Row>
    </>
  );
}

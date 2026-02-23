import React, { useEffect, useState, useRef } from "react";
import Webcam from "react-webcam";
import * as hands from "@mediapipe/hands";
import * as cam from "@mediapipe/camera_utils";
import { Hands } from "@mediapipe/hands";
import axios from "axios";
import { Image, Button, Result, PageHeader, Col, Row, Card, Typography } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";
import "antd/dist/antd.css";
import Test from "./Test";
import { StaticSignData } from "../../../Data/StaticSignData";
import { useNavigate, useParams } from "react-router-dom";

const { Title, Text } = Typography;

let time = 0;
let landmarks = null;

export default function PracticeStaticSign() {
  let navigate = useNavigate();
  const routeLearn = () => navigate("/learn-static-sign");

  const [predictData, setPredictData] = useState([]);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const connect = window.drawConnectors;
  var camera = null;
  const [learn, setLearn] = useState(true);
  const [practice, setPractice] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [cameraData, setCameraData] = useState(null);
  const [SignData, setSignData] = useState(StaticSignData);

  const [landmarkClass, setLandmarkClass] = useState("none");
  const [probability, setProbability] = useState(0);
  const { id } = useParams();

  const onClickStart = () => {
    setLearn(false);
    setPractice(true);
    startDetection();
  };

  async function onResults(results) {
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    let totalLandmarks = [];

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        connect(canvasCtx, landmarks, hands.HAND_CONNECTIONS, { color: "#00FF00", lineWidth: 4 });
        connect(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });

        landmarks.map((item) => {
          totalLandmarks.push(item.x, item.y, item.z);
        });
      }

      if (totalLandmarks.length === 63) {
        const result = await axios.post("http://127.0.0.1:5000/predict-static-sign", { temp: totalLandmarks });
        setLandmarkClass(result.data.predict);
        setProbability(result.data.probability);
      }
    }

    canvasCtx.restore();
  }

  const startDetection = () => {
    setIsStarted(true);
    setIsCameraOn(true);
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);
    if (webcamRef.current) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          try {
            await hands.send({ image: webcamRef.current.video });
          } catch (error) {}
        },
        width: 640,
        height: 480,
      });
      camera.start();
      setCameraData(camera);
    }
  };

  const stopDetection = () => {
    cameraData.stop();
    setIsStarted(false);
    setIsCameraOn(false);
    routeLearn();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card bordered className="shadow-sm rounded-2xl">
        <PageHeader
          onBack={() => window.history.back()}
          title="Static Sign Practice"
          subTitle="Learn and practice your static sign"
          style={{ borderBottom: "1px solid #f0f0f0" }}
        />

        <Row justify="center" align="middle" gutter={[32, 32]} style={{ marginTop: "40px" }}>
          {/* LEFT: SIGN IMAGE */}
          <Col xs={24} md={8} className="text-center">
            <Card bordered={false}>
              <Title level={4}>Target Sign</Title>
              <Image width={260} src={SignData[id - 1].alphabetImage} preview={false} className="rounded-lg" />
              <Text type="secondary" className="block mt-2">
                {SignData[id - 1].name}
              </Text>
            </Card>
          </Col>

          {/* MIDDLE: CAMERA */}
          <Col xs={24} md={8} className="text-center">
            <Card bordered className="shadow-sm">
              {isCameraOn ? (
                <Test webcamRef={webcamRef} canvasRef={canvasRef} />
              ) : (
                <div className="p-6 text-gray-400">Camera is off</div>
              )}
            </Card>
          </Col>

          {/* RIGHT: STATUS + BUTTONS */}
          <Col xs={24} md={8} className="text-center">
            <Card bordered={false}>
              {learn && (
                <Result
                  icon={<PlayCircleOutlined style={{ color: "#1677ff" }} />}
                  title="Ready to Practice?"
                  subTitle="Click below to start detecting your hand sign"
                  extra={<Button type="primary" size="large" onClick={onClickStart}>Start Practice</Button>}
                />
              )}

              {practice && probability > 0.7 && landmarkClass === SignData[id - 1].name && (
                <Result status="success" title="Great job!" subTitle="You’re doing it perfectly!" />
              )}

              {practice && probability <= 0.7 && landmarkClass === SignData[id - 1].name && (
                <Result status="warning" title="Almost there!" subTitle="Try to match the pose more closely." />
              )}

              {landmarkClass !== SignData[id - 1].name && !learn && (
                <Result status="error" title="Try Again!" subTitle="Your sign doesn’t match yet." />
              )}

              {!learn && (
                <Button danger size="middle" onClick={stopDetection} className="mt-4">
                  Back to Learning
                </Button>
              )}
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

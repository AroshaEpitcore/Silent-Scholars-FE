import React from "react";
import "./styles.css";
import { GrClose, GrLinkNext } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { useRef } from "react";
import Test from './Test';
import { useState } from "react";
import * as hands from "@mediapipe/hands";
import * as cam from "@mediapipe/camera_utils";
import { Hands } from "@mediapipe/hands";
import axios from "axios";
import { Image } from 'antd';
import 'antd/dist/antd.css';
import { CheckCircleOutlined, SmileOutlined, PlayCircleOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Button, Result, PageHeader } from 'antd';
import { Col, Row } from 'antd';
import { DogPoses } from '../../../Data/dynamicSign/DogPoses';


export default function PractiseDog() {
    const [predictData, setPredictData] = useState([]);
    const [cat, setCat] = useState(DogPoses);
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const connect = window.drawConnectors;
    var camera = null;
    const [learn, setLearn] = useState(true);
    const [start, setStart] = useState(true);
    const [result, setResult] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [cameraData, setCameraData] = useState(null);
    const [finish, setFinish] = useState(false);


    const [landmarkClass, setLandmarkClass] = useState("none");
    const [probability, setProbability] = useState(0);
    //use state for current step
    const [currentStep, setCurrentStep] = React.useState(1);
    const [currentPose, setCurrentPose] = React.useState(0);

    //on click start learning
    const onClickStart = () => {
        setLearn(false);
        startDetection();
        setResult(true);
        setStart(false);
    };

    let navigate = useNavigate();
    const routeDashboard = () => {
        let path = `/dashboard-animals`;
        navigate(path);
    }
    const routeBack = () => {
        let path = `/learn-cat`;
        navigate(path);
    }

    const routeResult = () => {
        let path = `/result`;
        navigate(path);
    }


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
                // connect(canvasCtx, landmarks, hands.HAND_CONNECTIONS, {
                //     color: '#00FF00',
                //     lineWidth: 5
                // });
                // connect(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });

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
                const result = await axios.post('http://127.0.0.1:5000/predict-test', data);
                setLandmarkClass(result.data.predict);
                setProbability(result.data.probability);
                if (result.data.probability > 0.9 && currentStep < 3 && cat[currentPose].name === result.data.predict && !finish) {
                    setCurrentStep(currentStep + 1);
                    setCurrentPose(currentPose + 1);
                }

                if (result.data.probability > 0.9 && currentStep < 3 && result.data.predict === 'dog-pose-2') {
                    setCurrentStep(3);
                    setFinish(true);
                    stopDetection();

                }
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
    const stopDetection = () => {
        setIsStarted(false);
        setIsCameraOn(false);
        //navigate to dashboard
        routeResult();
        camera.stop();
    };

    return (
        <>
            {/* <GrClose onClick={routeBack} className="position-absolute" style={{ marginRight: "110px", marginTop: "75px", right: "0", zIndex: "999" }} />
            <div className="container position-absolute top-50 start-50 translate-middle">
                <div className="row">
                    <div className="col columnCss" style={{ marginTop: "150px" }}>
                        <img src="images/sign-language.jpg" class="card-img-top" alt="..." />
                    </div>
                    <div className="col columnCss" style={{ marginTop: "150px" }}>
                        {isCameraOn && <Test webcamRef={webcamRef} canvasRef={canvasRef} />}
                    </div>
                </div>
            </div>
            <button className="btn btn-primary position-absolute" style={{ marginTop: "600px", marginLeft: "100px" }} onClick={startDetection}>Start Detection</button>
            <button onClick={routeDashboard} className="position-absolute" style={{ marginRight: "110px", right: "0", bottom: "0", zIndex: "999" }}>Finish <GrLinkNext /></button> */}

            <Row justify="center" align="middle" style={{ marginTop: '100px' }}>
                <Col span={8} align="center" justify="center">
                    <Image
                        width={400}
                        src={cat[currentPose].image}
                    />
                </Col>
                <Col span={8} align="center" justify="center">
                    {isCameraOn && <Test webcamRef={webcamRef} canvasRef={canvasRef} />}

                </Col>
                <Col span={8} align="center" justify="center">
                    {start && (
                        <Result
                            icon={<PlayCircleOutlined />}
                            title="Click Start to Practice!"
                            extra={<Button type="primary" onClick={onClickStart}>Start</Button>}
                        />)}
                    {/* show class and probability */}
                    {result && currentStep < 3 && (
                        <div>
                            <h4>Sign : {cat[currentPose].name}</h4>
                            <br />
                            {/*  show probability with two decimal places */}
                            <h4>Probability : { probability.toFixed(2)}</h4>
                        </div>
                    )}
                    {/* show class and probability */}

                    {currentStep == 3 && (
                        <Result
                            icon={<SmileOutlined />}
                            title="Great Job!"
                            subTitle="You have completed the practice session."
                            extra={<Button type="primary" onClick={routeBack}>Back</Button>}
                        />

                    )}
                </Col>
            </Row>
        </>
    );
}

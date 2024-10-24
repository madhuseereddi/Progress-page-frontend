// src/components/WebcamCapture/index.js
import React, { useRef } from "react";
import Webcam from "react-webcam";
import './index.css'; // Import the CSS for WebcamCapture

const WebcamCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    onCapture(imageSrc);
  }, [webcamRef, onCapture]);

  return (
    <>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={350}
        height={300}
      />
      <button onClick={capture}>Capture</button>
    </>
  );
};

export default WebcamCapture;

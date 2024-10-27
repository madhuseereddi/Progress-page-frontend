import React, { useRef } from "react";
import Webcam from "react-webcam";
import './index.css'; // Import the CSS for WebcamCapture

const WebcamCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);

  // The capture function will be called from the parent component
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    onCapture(imageSrc);
  };

  return (
    <>
        <div className="webcam-container">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={290}
          height={300}
          
        />
      </div>
      <button className="capture-button" onClick={capture} style={{ display: 'none' }}>Capture</button>
    </>
  );
};

export default WebcamCapture;

import React, { useEffect, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
import { ClipLoader } from "react-spinners"; // Import ClipLoader from react-spinners
import WebcamCapture from "../WebcamCapture"; // Adjust the path to your WebcamCapture component
import { Redirect, withRouter } from "react-router-dom"; // Import Redirect
import "./index.css"; // Make sure to include the CSS file

const logoUrl = "https://res.cloudinary.com/dx97khgxd/image/upload/v1729914119/Screenshot_2024-10-26_091114-removebg-preview_uqj5ji.png";

const FaceAuthorization = (props) => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [savedFaceDescriptor, setSavedFaceDescriptor] = useState(null);
  const [detected, setDetected] = useState(false);
  const [error, setError] = useState("");
  const [initialSetupDone, setInitialSetupDone] = useState(false);
  const [loading, setLoading] = useState(false); // State for loading
  const [redirect, setRedirect] = useState(false); // State for redirect
  const query = new URLSearchParams(window.location.search);
  const email = query.get("email");
  const emailSuffix = email ? email.split("@")[0] : ""; // Get the part before the '@'
 
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);
        setModelsLoaded(true);
        console.log("Face API models loaded.");
      } catch (err) {
        setError("Error loading models. Please check the models path.");
        console.error("Error loading models:", err);
      }
    };

    loadModels();
  }, []);

  useEffect(() => {
    const fetchSavedFaceDescriptor = async () => {
      const localDescriptor = localStorage.getItem(`savedFaceDescriptor_${emailSuffix}`);
      if (localDescriptor) {
        setSavedFaceDescriptor(new Float32Array(JSON.parse(localDescriptor)));
        setInitialSetupDone(true);
        return;
      }

      try {
        const response = await fetch("https://sharp-instinctive-ceres.glitch.me/getting_face_data");
        if (!response.ok) throw new Error("Failed to fetch face descriptor");
        const data = await response.json();
        if (data.length > 0) {
          const descriptor = new Float32Array(JSON.parse(data[0].imgSrc));
          setSavedFaceDescriptor(descriptor);
          localStorage.setItem(`savedFaceDescriptor_${emailSuffix}`, JSON.stringify(Array.from(descriptor)));
          setInitialSetupDone(true);
        }
      } catch (err) {
        console.error("Error loading face descriptor from database:", err);
      }
    };

    fetchSavedFaceDescriptor();
  }, [emailSuffix]);

  const handleCapture = useCallback(
    async (imageSrc) => {
      if (!modelsLoaded) {
        alert("Models are still loading, please wait.");
        return;
      }

      setLoading(true); // Start loading

      try {
        const img = await faceapi.fetchImage(imageSrc);
        const detection = await faceapi
          .detectSingleFace(img, new faceapi.SsdMobilenetv1Options())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          const descriptor = detection.descriptor;

          if (!initialSetupDone) {
            // Save face descriptor with email suffix
            setSavedFaceDescriptor(descriptor);
            await fetch("https://sharp-instinctive-ceres.glitch.me/save_face_data", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                day: new Date().toISOString().split("T")[0], 
                imgSrc: JSON.stringify(Array.from(descriptor)), 
                email: email // Include email in the body
              }),
            });
            localStorage.setItem(`savedFaceDescriptor_${emailSuffix}`, JSON.stringify(Array.from(descriptor))); // Save with email suffix
            setInitialSetupDone(true);
            alert("Face saved successfully. You will be recognized automatically next time.");
          } else {
            // Recognize face
            const faceMatcher = new faceapi.FaceMatcher(
              [new faceapi.LabeledFaceDescriptors(`${email}`, [savedFaceDescriptor])], // Use email in label
              0.6
            );
            const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

            if (bestMatch.label === email) {
              setDetected(true);
              alert("Face recognized. Access granted!");
              setError(""); // Clear any previous error
              setRedirect(true); // Set redirect to true
            } else {
              setDetected(false);
              setError("Face not recognized. Access denied.");
            }
          }
        } else {
          setDetected(false);
          setError("No face detected. Please try again.");
        }
      } catch (err) {
        setError("Error during face detection. Please check the camera and try again.");
      } finally {
        setLoading(false); // Stop loading
      }
    },
    [modelsLoaded, savedFaceDescriptor, initialSetupDone, email, emailSuffix] // Add email and emailSuffix to dependencies
  );

  if (redirect) {
    return <Redirect to="/todolist" />; // Redirect to the Todolist page
  }

  return (
    <div className="modal-backdrop">
      <div className="ddd1">
        <img src={logoUrl} alt="Logo" className="logo" />
        <div className="face-auth-modal">
          {modelsLoaded ? (
            <>
              <h1 className="h11">Face Authorization</h1>
              <h2 className="h22">{initialSetupDone ? "Recognize" : "One time Capture"}</h2>
              <WebcamCapture onCapture={handleCapture} />
              <button onClick={() => document.querySelector('.capture-button').click()} disabled={loading}>
                {loading ? <ClipLoader color="#ffffff" size={20} /> : "Capture"}
              </button>
              {error && <p className="modal-error" style={{ color: 'red' }}>{error}</p>} {/* Set error text to red */}
              {detected && <p className="modal-success">Face recognized successfully!</p>}
            </>
          ) : (
            <ClipLoader color="#4A90E2" loading={!modelsLoaded} size={50} className="loader" />
          )}
        </div>
      </div>
    </div>
  );
};

export default withRouter(FaceAuthorization);

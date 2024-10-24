// import React, { useEffect, useState, useCallback } from "react";
// import * as faceapi from "face-api.js";
// import WebcamCapture from "../WebcamCapture"; // Adjust the path to your WebcamCapture component

// const FaceAuthorization = () => {
//   const [modelsLoaded, setModelsLoaded] = useState(false);
//   const [savedFaceDescriptor, setSavedFaceDescriptor] = useState(null);
//   const [detected, setDetected] = useState(false);
//   const [error, setError] = useState("");
//   const [initialSetupDone, setInitialSetupDone] = useState(false);

//   useEffect(() => {
//     const loadModels = async () => {
//       try {
//         await Promise.all([
//           faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
//           faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
//           faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
//         ]);
//         setModelsLoaded(true);
//         console.log("Face API models loaded.");
//       } catch (err) {
//         setError("Error loading models. Please check the models path.");
//         console.error("Error loading models:", err);
//       }
//     };

//     loadModels();
//   }, []);

//   // Load saved face descriptor from local storage or the database
//   useEffect(() => {
//     const fetchSavedFaceDescriptor = async () => {
//       const localDescriptor = localStorage.getItem("savedFaceDescriptor");
//       if (localDescriptor) {
//         setSavedFaceDescriptor(new Float32Array(JSON.parse(localDescriptor)));
//         setInitialSetupDone(true);
//         console.log("Loaded face descriptor from local storage.");
//         return; // Exit early if descriptor is found in local storage
//       }

//       try {
//         const response = await fetch("http://localhost:5000/getting_face_data");
//         if (!response.ok) throw new Error("Failed to fetch face descriptor");
//         const data = await response.json();

//         if (data.length > 0) {
//           const descriptor = new Float32Array(JSON.parse(data[0].imgSrc));
//           setSavedFaceDescriptor(descriptor);
//           localStorage.setItem("savedFaceDescriptor", JSON.stringify(Array.from(descriptor))); // Save to local storage
//           setInitialSetupDone(true);
//           console.log("Loaded face descriptor from database.");
//         }
//       } catch (err) {
//         console.error("Error loading face descriptor from database:", err);
//       }
//     };

//     fetchSavedFaceDescriptor();
//   }, []);

//   const handleCaptureAndSave = useCallback(
//     async (imageSrc) => {
//       if (!modelsLoaded) {
//         alert("Models are still loading, please wait.");
//         return;
//       }

//       try {
//         const img = await faceapi.fetchImage(imageSrc);
//         const detection = await faceapi
//           .detectSingleFace(img, new faceapi.SsdMobilenetv1Options())
//           .withFaceLandmarks()
//           .withFaceDescriptor();

//         if (detection) {
//           const descriptor = detection.descriptor;
//           setSavedFaceDescriptor(descriptor);
//           console.log(descriptor);
//           // Save the descriptor to the database
//           await fetch("http://localhost:5000/save_face_data", {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               day: new Date().toISOString().split('T')[0], // current date
//               imgSrc: JSON.stringify(Array.from(descriptor)), // Save descriptor as a string
//             }),
//           });

//           // Save to local storage
//           localStorage.setItem("savedFaceDescriptor", JSON.stringify(Array.from(descriptor)));

//           setInitialSetupDone(true);
//           console.log("done");
//           alert("Face saved successfully. You will be recognized automatically next time.");
//         } else {
//           alert("No face detected. Please try again.");
//         }
//       } catch (err) {
//         setError("Error during face detection. Please check the camera and try again.");
//         console.error("Error during face detection:", err);
//       }
//     },
//     [modelsLoaded]
//   );

//   const handleCaptureAndRecognize = useCallback(
//     async (imageSrc) => {
//       if (!modelsLoaded) {
//         alert("Models are still loading, please wait.");
//         return;
//       }
//       if (!savedFaceDescriptor) {
//         alert("No face saved for recognition. Please save a face first.");
//         return;
//       }

//       try {
//         const img = await faceapi.fetchImage(imageSrc);
//         const detection = await faceapi
//           .detectSingleFace(img, new faceapi.SsdMobilenetv1Options())
//           .withFaceLandmarks()
//           .withFaceDescriptor();

//         if (detection) {
//           const faceMatcher = new faceapi.FaceMatcher(
//             [new faceapi.LabeledFaceDescriptors("savedUser", [savedFaceDescriptor])],
//             0.6
//           );
//           const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

//           if (bestMatch.label === "savedUser") {
//             setDetected(true);
//             alert("Face recognized. Access granted!");
//           } else {
//             setDetected(false);
//             alert("Face not recognized. Access denied.");
//           }
//         } else {
//           alert("No face detected. Please try again.");
//         }
//       } catch (err) {
//         setError("Error during face recognition. Please check the camera and try again.");
//         console.error("Error during face recognition:", err);
//       }
//     },
//     [modelsLoaded, savedFaceDescriptor]
//   );

//   return (
//     <div>
//       {modelsLoaded ? (
//         <>
//           <h1>Face Authorization</h1>

//           {!initialSetupDone ? (
//             <>
//               <h2>Step 1: Save Face</h2>
//               <WebcamCapture onCapture={handleCaptureAndSave} />
//               <button onClick={() => alert("Capture to save your face.")}>
//                 Save Face
//               </button>
//             </>
//           ) : (
//             <>
//               <h2>Step 2: Recognize Face</h2>
//               <WebcamCapture onCapture={handleCaptureAndRecognize} />
//               <button onClick={() => alert("Capture to recognize your face.")}>
//                 Recognize Face
//               </button>
//             </>
//           )}

//           {error && <p style={{ color: "red" }}>{error}</p>}
//           {detected && <p style={{ color: "green" }}>Face recognized successfully!</p>}
//         </>
//       ) : (
//         <p>Loading models, please wait...</p>
//       )}
//     </div>
//   );
// };

// export default FaceAuthorization;

import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

const ZxingScanner = () => {
  const videoRef = useRef(null);
  const sourceSelectRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [result, setResult] = useState("");
  const [zoom, setZoom] = useState(1); // Default zoom level
  const [maxZoom, setMaxZoom] = useState(1); // Maximum zoom level supported by the camera
  const codeReader = useRef(null);

  useEffect(() => {
    const initCodeReader = async () => {
      codeReader.current = new BrowserMultiFormatReader();
      console.log("ZXing code reader initialized");

      try {
        const videoInputDevices = await codeReader.current.listVideoInputDevices();
        setDevices(videoInputDevices);
        if (videoInputDevices.length > 0) {
          setSelectedDeviceId(videoInputDevices[0].deviceId);
        }
      } catch (err) {
        console.error(err);
      }
    };

    initCodeReader();
    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []);

  const handleStart = async () => {
    if (codeReader.current && videoRef.current) {
      codeReader.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
            console.log(result);
            setResult(result.text);
            alert(result.text);
            handleReset();
          }
          if (err && !(err instanceof NotFoundException)) {
            console.error(err);
            setResult(err.toString());
          }
        }
      );
      console.log(`Started continuous decode from camera with id ${selectedDeviceId}`);
  
      // Access the media track to control zoom
      const stream = videoRef.current.srcObject;
      if (stream) {
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
  
        if (capabilities && capabilities.zoom) {
          setMaxZoom(capabilities.zoom.max); // Set maximum zoom supported by the camera
          setZoom(capabilities.zoom.min || 1); // Set initial zoom level to the minimum supported
        } else {
          console.log("Zoom capability not supported on this device.");
        }
      }
    }
  };
  

  const handleZoomChange = (e) => {
    const newZoom = parseFloat(e.target.value);
    setZoom(newZoom);

    const stream = videoRef.current.srcObject;
    if (stream) {
      const track = stream.getVideoTracks()[0];
      track.applyConstraints({
        advanced: [{ zoom: newZoom }],
      });
    }
  };

  const handleReset = () => {
    if (codeReader.current) {
      codeReader.current.reset();
      console.log("Reset.");
    }
  };

  return (
    <main style={{ paddingTop: "2em" }}>
      <section>
        <h1>Scan 1D/2D Code from Video Camera Testing</h1>
        <p>Scan QR code and test if it's working?</p>

        <div>
          <button className="button" onClick={handleStart}>
            Start
          </button>
          <button className="button" onClick={handleReset}>
            Reset
          </button>
        </div>

        <div>
          <video ref={videoRef} width="300" height="200" style={{ border: "1px solid gray" }} />
        </div>

        {devices.length > 1 && (
          <div>
            <label htmlFor="sourceSelect">Change video source:</label>
            <select
              id="sourceSelect"
              ref={sourceSelectRef}
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              style={{ maxWidth: "400px" }}
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {maxZoom > 1 && (
          <div>
            <label htmlFor="zoomControl">Zoom:</label>
            <input
              id="zoomControl"
              type="range"
              min="1"
              max={maxZoom}
              step="0.1"
              value={zoom}
              onChange={handleZoomChange}
            />
          </div>
        )}

        <label>Result:</label>
        <pre>
          <code>{result}</code>
        </pre>
      </section>
    </main>
  );
};

export default ZxingScanner;

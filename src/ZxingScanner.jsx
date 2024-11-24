import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";

const ZxingScanner = () => {
  const videoRef = useRef(null);
  const sourceSelectRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [result, setResult] = useState("");
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

  const handleStart = () => {
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
        <h1>Scan 1D/2D Code from Video Camera</h1>
        

        <div>
          <button className="button" onClick={handleStart}>
            Start
          </button>
          <button className="button" onClick={handleReset}>
            Reset
          </button>
        </div>

        <div>
          <video ref={videoRef} width="500" height="300" style={{ border: "1px solid gray" }} />
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

        <label>Result:</label>
        <pre>
          <code>{result}</code>
        </pre>

      </section>

    </main>
  );
};

export default ZxingScanner;

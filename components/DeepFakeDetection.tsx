"use client";

import { useState, useEffect } from "react";

const DeepFakeDetection = () => {
  const [analysisResults, setAnalysisResults] = useState<
    { timestamp: string; result: boolean }[]
  >([]);

  useEffect(() => {
    const analyzeStoredAudio = async () => {
      // Get all keys from local storage that start with 'audio_'
      const audioKeys = Object.keys(localStorage).filter((key) =>
        key.startsWith("audio_")
      );

      for (const key of audioKeys) {
        const audioUrl = localStorage.getItem(key);
        if (audioUrl) {
          // Fetch the audio data
          const response = await fetch(audioUrl);
          const audioBlob = await response.blob();

          // Here, you would send the audioBlob to your ML model
          // For now, we'll use a placeholder function
          const isDeepFake = await analyzeAudio(audioBlob);

          setAnalysisResults((prev) => [
            ...prev,
            { timestamp: key.split("_")[1], result: isDeepFake },
          ]);

          // Remove the analyzed audio from local storage
          localStorage.removeItem(key);
        }
      }
    };

    const intervalId = setInterval(analyzeStoredAudio, 10000); // Run every 10 seconds

    return () => clearInterval(intervalId);
  }, []);

  // Placeholder function for audio analysis
  const analyzeAudio = async (audioBlob: Blob): Promise<boolean> => {
    // This is where you would integrate your ML model
    // For now, we'll return a random result
    return Math.random() > 0.5;
  };

  return (
    <div>
      <h2>Deep Fake Detection Results</h2>
      <ul>
        {analysisResults.map((result, index) => (
          <li key={index}>
            {result.timestamp}:{" "}
            {result.result ? "Potential Deep Fake" : "Likely Authentic"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DeepFakeDetection;

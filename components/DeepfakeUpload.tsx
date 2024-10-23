"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress"; // Assuming you have a Progress component
import DetectionResult from "./DetectionResult";

const DeepFakeUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detectionResult, setDetectionResult] = useState<{
    deepfake_probability: number;
    prediction_score: string;
    confidence_metrics: {
      average_probability: number;
      max_probability: number;
    };
  } | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle form submission and file upload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      alert("Please select a .wav file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setIsUploading(true);

      // Send the file using fetch
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const result = await response.json();
      console.log(result);
      setDetectionResult({
        deepfake_probability: result.deepfake_probability,
        prediction_score: result.prediction_score,
        confidence_metrics: result.confidence_metrics,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("There was an error processing your file.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">
        Upload Audio File for DeepFake Detection
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* File Input */}
        <input
          type="file"
          accept=".wav"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload and Analyze"}
        </Button>
      </form>

      {/* Result Display */}
      {detectionResult && (
        <div className="mt-6">
          {/* Display the detection result message */}
          <DetectionResult
            probability={detectionResult.deepfake_probability}
            prediction_score={detectionResult.prediction_score}
            confidence_metrics={detectionResult.confidence_metrics}
          />
        </div>
      )}
    </div>
  );
};

export default DeepFakeUpload;

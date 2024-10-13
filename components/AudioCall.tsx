"use client";

import { useSocket } from "@/context/SocketContext";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import AudioVisualizer from "./AudioVisualizer";

const AudioCall = () => {
  const { localStream, peer, isCallEnded, ongoingCall, handleHangup } =
    useSocket();
  const [isMicOn, setIsMicOn] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [detectionResult, setDetectionResult] = useState<{
    probability: number;
  } | null>(null);

  useEffect(() => {
    if (localStream) {
      startRecording();
    }
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [localStream]);

  const startRecording = () => {
    if (!localStream) return;

    const startNewRecording = () => {
      const mediaRecorder = new MediaRecorder(localStream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        convertToWavAndSend(audioBlob);
      };

      mediaRecorder.start();
    };

    startNewRecording();

    recordingIntervalRef.current = setInterval(() => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
      startNewRecording();
    }, 5000);
  };

  const stopRecording = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  const convertToWavAndSend = async (webmBlob: Blob) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const wavBuffer = audioBufferToWav(audioBuffer);
    const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });

    sendAudioToServer(wavBlob);
  };

  const sendAudioToServer = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, `recording_${Date.now()}.wav`);

    try {
      const response = await fetch("http://localhost:8080/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload audio");
      }

      const result = await response.json();
      console.log("Deep fake detection result:", result);

      setDetectionResult({
        probability: result.deepfake_probability,
      });
    } catch (error) {
      console.error("Error uploading audio chunk:", error);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  };

  if (isCallEnded) {
    return <div className="mt-5 text-rose-500">Call Ended</div>;
  }

  if (!localStream && !peer) return null;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Audio Call</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <AudioVisualizer stream={localStream} />
          {peer && peer.stream && <AudioVisualizer stream={peer.stream} />}
        </div>
        <div className="flex justify-center space-x-4 mb-6">
          <Button
            variant={isMicOn ? "default" : "secondary"}
            onClick={toggleAudio}
          >
            {isMicOn ? <Mic /> : <MicOff />}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              stopRecording();
              handleHangup({
                ongoingCall: ongoingCall ? ongoingCall : undefined,
              });
            }}
          >
            <PhoneOff />
          </Button>
        </div>
        {detectionResult && (
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Deep Fake Probability
            </h3>
            <Progress
              value={detectionResult.probability * 100}
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              {(detectionResult.probability * 100).toFixed(2)}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to convert AudioBuffer to WAV format
function audioBufferToWav(buffer: AudioBuffer) {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new ArrayBuffer(length);
  const view = new DataView(out);
  let sample;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  // write interleaved data
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    const channel = buffer.getChannelData(i);
    for (let j = 0; j < buffer.length; j++) {
      sample = Math.max(-1, Math.min(1, channel[j]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
  }

  return out;

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}
export default AudioCall;

"use client";

import { useSocket } from "@/context/SocketContext";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import AudioVisualizer from "./AudioVisualizer";
import CallingScreen from "./CallingScreen";

const AudioCall = () => {
  const {
    localStream,
    peer,
    isCallEnded,
    ongoingCall,
    handleHangup,
    isWaitingForAnswer,
    isCaller,
  } = useSocket();
  const [isMicOn, setIsMicOn] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [detectionResult, setDetectionResult] = useState<{
    probability: number;
  } | null>(null);
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (localStream && localAudioRef.current) {
      localAudioRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (peer && peer.stream && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = peer.stream;
    }
  }, [peer]);

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
        mimeType: "audio/webm;codecs=opus", // Specify codec explicitly
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
          type: "audio/webm;codecs=opus",
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
    try {
      const audioContext = new window.AudioContext();
      const arrayBuffer = await webmBlob.arrayBuffer();

      // Add error handling for decodeAudioData
      try {
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const wavBuffer = audioBufferToWav(audioBuffer);
        const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });
        await sendAudioToServer(wavBlob);
      } catch (decodeError) {
        console.error("Error decoding audio:", decodeError);
        // Send the original WebM blob if decoding fails
        await sendAudioToServer(webmBlob);
      }
    } catch (error) {
      console.error("Error in audio conversion:", error);
    }
  };

  const sendAudioToServer = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, `recording_${Date.now()}.wav`);

    try {
      const response = await fetch("http://192.168.1.246:5000/predict", {
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

  // Only show calling screen if this user is the caller and waiting for answer
  if (isWaitingForAnswer && isCaller && ongoingCall) {
    return (
      <CallingScreen
        receiver={ongoingCall.participants.receiver}
        onCancel={() => handleHangup({ ongoingCall })}
      />
    );
  }

  if (!localStream && !peer) return null;

  if (localStream || peer) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>
            Audio Call with{" "}
            {isCaller
              ? ongoingCall?.participants.receiver.profile.fullName
              : ongoingCall?.participants.caller.profile.fullName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <audio
            ref={localAudioRef}
            autoPlay
            muted
          />
          <audio
            ref={remoteAudioRef}
            autoPlay
          />
          <div className="mb-4 space-y-4">
            <div className="relative">
              <div className="absolute top-2 left-2 text-xs text-gray-500">
                Your Audio
              </div>
              <AudioVisualizer stream={localStream} />
            </div>
            {peer && peer.stream && (
              <div className="relative">
                <div className="absolute top-2 left-2 text-xs text-gray-500">
                  Remote Audio
                </div>
                <AudioVisualizer stream={peer.stream} />
              </div>
            )}
          </div>
          <div className="flex justify-center space-x-4 mb-6">
            <Button
              variant={isMicOn ? "default" : "secondary"}
              onClick={toggleAudio}
              className="w-12 h-12"
            >
              {isMicOn ? (
                <Mic className="h-6 w-6" />
              ) : (
                <MicOff className="h-6 w-6" />
              )}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                stopRecording();
                handleHangup({
                  ongoingCall: ongoingCall ? ongoingCall : undefined,
                });
              }}
              className="w-12 h-12"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>
          {detectionResult && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Deep Fake Analysis</h3>
              <Progress
                value={detectionResult.probability * 100}
                className="w-full h-2"
              />
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>Authentic</span>
                <span className="font-medium">
                  {(detectionResult.probability * 100).toFixed(1)}%
                </span>
                <span>Deep Fake</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
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

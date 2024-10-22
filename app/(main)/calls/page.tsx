"use client";

import { useSocket } from "@/context/SocketContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AudioCall from "@/components/AudioCall";
import CallingScreen from "@/components/CallingScreen";

export default function CallsPage() {
  const { ongoingCall, isWaitingForAnswer, isCaller } = useSocket();
  const router = useRouter();

  useEffect(() => {
    if (!ongoingCall) {
      router.push("/dashboard");
    }
  }, [ongoingCall, router]);

  if (!ongoingCall) return null;

  if (isWaitingForAnswer && isCaller) {
    return <CallingScreen receiver={ongoingCall.participants.receiver} />;
  }

  return <AudioCall />;
}

"use client";

import AudioCall from "@/components/AudioCall";
import { useSocket } from "@/context/SocketContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CallsPage() {
  const { ongoingCall } = useSocket();
  const router = useRouter();

  useEffect(() => {
    if (!ongoingCall) {
      router.push("/dashboard");
    }
  }, [ongoingCall, router]);

  return (
    <div className="container mx-auto p-4">
      <AudioCall />
    </div>
  );
}

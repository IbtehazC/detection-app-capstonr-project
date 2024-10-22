"use client";

import { useSocket } from "@/context/SocketContext";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, PhoneOff } from "lucide-react";

const CallNotification = () => {
  const { ongoingCall, handleJoinCall, handleHangup } = useSocket();
  const { user } = useUser();
  const router = useRouter();

  if (
    !ongoingCall?.isRinging ||
    !user ||
    ongoingCall.participants.receiver.userId !== user.id
  ) {
    return null;
  }

  const handleAcceptCall = async () => {
    await handleJoinCall(ongoingCall);
    router.push("/calls");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Incoming Audio Call</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage
              src={ongoingCall.participants.caller.profile.imageUrl}
            />
            <AvatarFallback>
              {ongoingCall.participants.caller.profile.fullName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <p className="text-lg font-semibold mb-6">
            {ongoingCall.participants.caller.profile.fullName?.split(" ")[0]}
          </p>
          <div className="flex space-x-4">
            <Button
              variant="default"
              onClick={handleAcceptCall}
              className="min-w-[120px]"
            >
              <Phone className="mr-2 h-4 w-4" /> Accept
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleHangup({ ongoingCall })}
              className="min-w-[120px]"
            >
              <PhoneOff className="mr-2 h-4 w-4" /> Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CallNotification;

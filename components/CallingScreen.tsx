"use client";

import { useSocket } from "@/context/SocketContext";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PhoneOff, LoaderCircle } from "lucide-react";
import { SocketUser } from "@/types";

interface CallingScreenProps {
  receiver: SocketUser;
  onCancel: () => void;
}

const CallingScreen = ({ receiver }: CallingScreenProps) => {
  const { ongoingCall, handleHangup } = useSocket();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="flex flex-col items-center justify-center py-8">
        <Avatar className="w-20 h-20 mb-4">
          <AvatarImage src={receiver.profile.imageUrl} />
          <AvatarFallback>{receiver.profile.fullName?.[0]}</AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-semibold mb-2">
          {receiver.profile.fullName}
        </h2>
        <div className="flex items-center gap-2 text-muted-foreground mb-6">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          <span>Calling...</span>
        </div>
        <Button
          variant="destructive"
          className="rounded-full p-6"
          onClick={() => ongoingCall && handleHangup({ ongoingCall })}
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default CallingScreen;

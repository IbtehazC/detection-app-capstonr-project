"use client";

import { useSocket } from "@/context/SocketContext";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

const ListOnlineUsers = () => {
  const { user } = useUser();
  const { onlineUsers, handleCall } = useSocket();

  return (
    <div className="flex flex-wrap gap-4 w-full items-center pb-4 border-b border-gray-200">
      {onlineUsers &&
        onlineUsers.map((onlineUser) => {
          if (onlineUser.profile.id === user?.id) return null;

          return (
            <div
              key={onlineUser.profile.id}
              className="flex flex-col items-center"
            >
              <Avatar className="w-16 h-16 mb-2">
                <AvatarImage src={onlineUser.profile.imageUrl} />
                <AvatarFallback>
                  {onlineUser.profile.fullName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium mb-1">
                {onlineUser.profile.fullName?.split(" ")[0]}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCall(onlineUser)}
              >
                <Phone className="mr-2 h-4 w-4" /> Call
              </Button>
            </div>
          );
        })}
    </div>
  );
};

export default ListOnlineUsers;

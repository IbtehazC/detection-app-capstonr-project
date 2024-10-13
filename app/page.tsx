"use client";

import CallNotification from "@/components/CallNotification";
import AudioCall from "@/components/AudioCall";
import ListOnlineUsers from "@/components/ListOnlineUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Online Users</CardTitle>
        </CardHeader>
        <CardContent>
          <ListOnlineUsers />
        </CardContent>
      </Card>

      <AudioCall />
      <CallNotification />
    </div>
  );
}

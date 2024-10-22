"use client";

import ListOnlineUsers from "@/components/ListOnlineUsers";
import CallNotification from "@/components/CallNotification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
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
      <CallNotification />
    </div>
  );
}

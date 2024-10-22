"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && userId) {
      router.push("/dashboard");
    }
  }, [userId, isLoaded, router]);

  if (!isLoaded || userId) {
    return null; // or a loading spinner
  }

  return (
    <div className="w-full text-center space-y-6">
      <h1 className="text-4xl font-bold">Welcome to AudioGuard</h1>
      <p className="text-gray-600 text-lg max-w-md mx-auto">
        Secure audio calls with real-time deep fake detection
      </p>
      <div className="space-x-4">
        <Button asChild>
          <Link href="/sign-up">Get Started</Link>
        </Button>
        <Button
          variant="outline"
          asChild
        >
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </div>
    </div>
  );
}

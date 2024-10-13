"use client";

import { UserButton, useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import Container from "./Container";
import { Video } from "lucide-react";

const NavBar = () => {
  const router = useRouter();
  const { userId } = useAuth();
  const { signOut } = useClerk();

  const handleLogout = () => {
    signOut(() => router.push("/"));
  };

  return (
    <div className="sticky top-0 bg-primary text-primary-foreground shadow-md">
      <Container>
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <Video className="h-6 w-6" />
            <div className="font-bold text-xl">AudioGuard</div>
          </div>
          <div className="flex gap-4 items-center">
            {userId ? (
              <>
                <UserButton afterSignOutUrl="/" />
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  size="sm"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => router.push("/sign-in")}
                  variant="secondary"
                  size="sm"
                >
                  Sign in
                </Button>
                <Button
                  onClick={() => router.push("/sign-up")}
                  variant="outline"
                  size="sm"
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default NavBar;

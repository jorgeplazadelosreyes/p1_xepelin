"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { logOut, checkAuth } from "@/lib/actions";

export default function Home() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      checkAuth(status);
    }
  }, [status]);

  if (status === "unauthenticated") return null;

  const handleSignOut = async () => {
    await logOut();
  };

  return (
    <div className="container mx-auto p-6">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Xepelin Rate Manager</h1>
        <div className="flex items-center gap-4">
          <span>Welcome, {session?.user?.name || session?.user?.email}</span>
          <button
            onClick={handleSignOut}
            className="rounded-md bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
          >
            Sign out
          </button>
        </div>
      </header>
    </div>
  );
}

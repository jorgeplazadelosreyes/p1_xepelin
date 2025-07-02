"use client";

import { signIn, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { authConfig } from "@/config/auth";

export async function logIn(email: string, password: string) {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) return { success: false, error: "Invalid credentials" };

    return { success: true };
}

export const logOut = async () => {
  await signOut({ callbackUrl: authConfig.loginUrl });
}

export function checkAuth(status: string, redirectPath: string = authConfig.loginUrl) {
  if (status === "unauthenticated") redirect(redirectPath);
}

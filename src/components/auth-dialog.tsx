"use client";

import Script from "next/script";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

async function executeRecaptcha(action: string): Promise<string | null> {
  if (!RECAPTCHA_SITE_KEY) return null;
  if (typeof window === "undefined" || !window.grecaptcha) return null;
  return await new Promise<string>((resolve, reject) => {
    window.grecaptcha!.ready(async () => {
      try {
        const token = await window.grecaptcha!.execute(RECAPTCHA_SITE_KEY, {
          action,
        });
        resolve(token);
      } catch (e) {
        reject(e);
      }
    });
  });
}

async function verifyRecaptchaToken(token: string): Promise<boolean> {
  const res = await fetch("/api/auth/recaptcha-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  const data = await res.json().catch(() => ({ success: false }));
  return Boolean(data.success);
}

export function AuthDialog() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  async function guardCaptcha(action: string): Promise<boolean> {
    if (!RECAPTCHA_SITE_KEY) return true;
    try {
      const token = await executeRecaptcha(action);
      if (!token) {
        toast.error("Captcha unavailable. Try again.");
        return false;
      }
      const ok = await verifyRecaptchaToken(token);
      if (!ok) toast.error("Captcha verification failed.");
      return ok;
    } catch {
      toast.error("Captcha error.");
      return false;
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const ok = await guardCaptcha("login");
      if (!ok) return;
      const res = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });
      if (res?.error) {
        toast.error("Invalid email or password.");
        return;
      }
      toast.success("Signed in.");
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const ok = await guardCaptcha("signup");
      if (!ok) return;
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error ?? "Signup failed.");
        return;
      }
      const signed = await signIn("credentials", {
        email: signupEmail,
        password: signupPassword,
        redirect: false,
      });
      if (signed?.error) {
        toast.error("Account created. Please sign in.");
        setTab("login");
        return;
      }
      toast.success("Account created.");
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      await signIn("google", { callbackUrl: window.location.href });
    } finally {
      setBusy(false);
    }
  }

  if (status === "authenticated") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {session?.user?.name ?? session?.user?.email}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer"
          onClick={() => signOut()}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <>
      {RECAPTCHA_SITE_KEY ? (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
      ) : null}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button size="sm" className="cursor-pointer h-8">
              Sign in
            </Button>
          }
        />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome</DialogTitle>
            <DialogDescription>
              Sign in to backup your brain :)
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={tab}
            className="flex flex-col"
            onValueChange={(v) => setTab(v as "login" | "signup")}
          >
            <TabsList className="w-full">
              <TabsTrigger value="login" className="flex-1 cursor-pointer">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex-1 cursor-pointer">
                Sign up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-4">
              <form onSubmit={handleLogin} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.currentTarget.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.currentTarget.value)}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={busy}
                  className="cursor-pointer"
                >
                  {busy ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-4">
              <form onSubmit={handleSignup} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="signup-name">Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    required
                    minLength={3}
                    autoComplete="name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.currentTarget.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.currentTarget.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.currentTarget.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="confirm-password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.currentTarget.value)}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={busy}
                  className="cursor-pointer"
                >
                  {busy ? "Creating..." : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-popover px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={handleGoogle}
            className="cursor-pointer gap-2"
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          {RECAPTCHA_SITE_KEY ? (
            <p className="text-[10px] text-muted-foreground text-center mt-1">
              Protected by reCAPTCHA.
            </p>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.6-2.5C16.9 3.5 14.7 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12s4.2 9.5 9.4 9.5c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z"
      />
    </svg>
  );
}

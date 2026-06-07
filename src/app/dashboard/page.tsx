"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, RotateCcw, Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { request } from "@/lib/apiCaller";

interface HelloResponse {
  message: string;
  timestamp: string;
}

export default function DashboardPage() {
  const [count, setCount] = useState(0);
  const { data, error, isFetching, refetch } = useQuery({
    queryKey: ["hello", count],
    queryFn: () =>
      request<HelloResponse>({
        url: "/api/hello",
        method: "GET",
        params: { name: `user-${count}` },
      }),
  });

  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold tracking-tight"
      >
        Dashboard
      </motion.h1>
      <p className="mt-2 text-muted-foreground">
        React Query + Axios + animated UI.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Counter</CardTitle>
            <CardDescription>Local component state.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={count}
                initial={{ scale: 0.6, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.6, opacity: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-6xl font-bold tabular-nums"
              >
                {count}
              </motion.span>
            </AnimatePresence>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setCount((c) => c - 1)}
              >
                <Minus />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setCount(0)}
              >
                <RotateCcw />
              </Button>
              <Button size="icon" onClick={() => setCount((c) => c + 1)}>
                <Plus />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API call (Axios + React Query)</CardTitle>
            <CardDescription>GET /api/hello?name=user-{count}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => refetch()}
              disabled={isFetching}
              className="w-full"
            >
              <Send /> {isFetching ? "Loading..." : "Fetch"}
            </Button>
            <AnimatePresence mode="wait">
              {error && (
                <motion.pre
                  key="err"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  {(error as Error).message}
                </motion.pre>
              )}
              {data && !error && (
                <motion.pre
                  key={data.timestamp}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="overflow-auto rounded-md border border-border bg-muted p-3 text-xs"
                >
                  {JSON.stringify(data, null, 2)}
                </motion.pre>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

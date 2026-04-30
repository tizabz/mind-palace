"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const stack = [
  { name: "Next.js 16", desc: "App Router + Server Components" },
  { name: "Tailwind v4", desc: "Utility-first styling" },
  { name: "shadcn/ui", desc: "Accessible component primitives" },
  { name: "Framer Motion", desc: "Animations and transitions" },
  { name: "Zustand", desc: "Lightweight state management" },
  { name: "Axios", desc: "HTTP client with interceptors" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Home() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-start gap-6"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" /> starter ready
        </span>
        <h1 className="text-5xl font-bold tracking-tight">
          Build fast. Ship faster.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Opinionated Next.js starter with shadcn/ui, Tailwind, Framer Motion,
          Zustand, and Axios. Drop-in foundation for new projects.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/dashboard">
              Open dashboard <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/api/hello?name=dev" target="_blank">
              Test API
            </Link>
          </Button>
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {stack.map((s) => (
          <motion.div key={s.name} variants={item}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">{s.name}</CardTitle>
                <CardDescription>{s.desc}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

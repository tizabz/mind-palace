"use client";

import { motion } from "framer-motion";
import {
  Brain,
  BrainCircuit,
  BrainCog,
  Castle,
  ListTodo,
  LucideProps,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

const stack = [
  {
    name: "Higher Order Thinking",
    desc: "Wana get your thinking ablities maxed out? Tap here (coming soon)",
    icon: BrainCog,
    url: "#",
  },
  {
    name: "Decision Making Matrix",
    desc: "I will help you decide, with math XD",
    icon: ListTodo,
    url: "/decision",
  },
  {
    name: "Memory Palace",
    desc: "Increase your Maximum Brain Storage With the memory palace techniques (coming soon)",
    url: "#",
    icon: ({ className, ...iconProps }: LucideProps) => (
      <div className="relative -translate-y-1">
        <Castle className={cn(className)} {...iconProps} />
        <Brain
          className={cn(
            className,
            "absolute -bottom-5 scale-[-75%] z-10 bg-background rounded-4xl",
          )}
        />
      </div>
    ),
  },
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
          <BrainCircuit className="h-3.5 w-3.5" /> its big brain time
        </span>
        <h1 className="text-5xl font-bold tracking-tight">
          Keep Your Mind Sharp!
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          With Mind Palace, you can increase your performance in memorizing,
          decision making, and higher order thinking
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {stack.map((s) => (
          <motion.div key={s.name} variants={item}>
            <Link href={s.url}>
              <Card className="h-full overflow-hidden hover:-translate-y-2.5 transition-all duration-300">
                <CardContent className="flex justify-around items-center flex-col p-8 h-48 relative group cursor-pointer">
                  <s.icon className="size-12 text-primary opacity-70 group-hover:opacity-100 transition-all duration-300" />
                  <CardTitle className="text-lg opacity-75 group-hover:opacity-100 transition-all duration-300">
                    {s.name}
                  </CardTitle>
                  <CardDescription className="text-md text-foreground absolute text-center w-full h-1/2 p-4 bg-linear-to-t from-background/65 to-card backdrop-blur-xs invisible -bottom-4 opacity-0 group-hover:bottom-0 group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    {s.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

"use client";
import { motion } from "framer-motion";

export default function DashboardPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-12">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold tracking-tight"
      >
        Nothing here yet
      </motion.h1>
      <motion.h3
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        still under constructions :)
      </motion.h3>
    </section>
  );
}

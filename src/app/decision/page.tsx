"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "framer-motion";
import { ListTodo } from "lucide-react";
import { useState } from "react";
import Factors from "@/app/decision/factors";
import Ratings from "@/app/decision/ratings";
import Result from "@/app/decision/result";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const TabsKeys = ["factors", "ratings", "result"] as const;
type TabKey = (typeof TabsKeys)[number];
const TabContents: Record<TabKey, React.ComponentType> = {
  factors: Factors,
  ratings: Ratings,
  result: Result,
};

const DecisionPage = () => {
  const [tab, setTab] = useState<TabKey>(TabsKeys[0]);

  const CurrentTabContent = TabContents[tab];
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-start gap-6"
      >
        <h1 className="text-3xl font-bold tracking-tight flex gap-2 items-center">
          <ListTodo className="h-8 w-8" /> Decision Making Matrix
        </h1>
        <p className="w-3/4">
          This tool helps you compare choices using simple math. First, set how
          important each factor is (weight), then rate how well each option
          performs. We multiply importance × rating for every factor, then add
          the results. The option with the highest total is the best match for
          your priorities.
        </p>
        <span>
          Weight = how much this matters
          <br />
          Rating = how good this option is
          <br />
          Higher total = better match
        </span>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-16"
      >
        <div className="mb-24">
          <Tabs value={tab} onValueChange={setTab} className="flex flex-col">
            <TabsList className="mx-auto gap-2">
              {TabsKeys.map((tabkey) => (
                <TabsTrigger
                  key={tabkey}
                  value={tabkey}
                  className="cursor-pointer text-md transition-all duration-300 data-active:bg-primary! data-active:text-primary-foreground! capitalize"
                >
                  {tabkey}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.1, ease: "easeOut" }}
                >
                  <CurrentTabContent />
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
        </div>
      </motion.div>
    </section>
  );
};

export default DecisionPage;

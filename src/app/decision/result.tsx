"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ChessQueen } from "lucide-react";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { useDecisions } from "@/hooks/useDecisions";
import { sortByScore } from "@/lib/decision-utils";
import type { DecisionFactor, DecisionOptions } from "@/models/Decision";

function OptionResult({
  option,
  factors,
  allOtherOptions,
}: {
  option: DecisionOptions;
  factors: DecisionFactor[];
  allOtherOptions: DecisionOptions[];
}) {
  const breakdown = useMemo(() => {
    return factors.map((f) => {
      const rating = option.ratings[f.id] || 0;
      const contribution = f.factorWeight * rating;
      return {
        id: f.id,
        name: f.factorName,
        weight: f.factorWeight,
        rating,
        contribution,
      };
    });
  }, [option, factors]);

  const total = useMemo(
    () => breakdown.reduce((sum, f) => sum + f.contribution, 0),
    [breakdown],
  );

  const topFactor = [...breakdown].sort(
    (a, b) => b.contribution - a.contribution,
  )[0];

  const mostImportant = [...factors].sort(
    (a, b) => b.factorWeight - a.factorWeight,
  )[0];

  const advantage = useMemo(() => {
    return factors
      .map((f) => {
        const my = option.ratings[f.id] || 0;
        const avgOther =
          allOtherOptions.reduce(
            (sum, o) => sum + (o.ratings[f.id] || 0),
            0,
          ) / (allOtherOptions.length - 1 || 1);
        return {
          name: f.factorName,
          diff: my - avgOther,
        };
      })
      .sort((a, b) => b.diff - a.diff)[0];
  }, [option, allOtherOptions, factors]);

  return (
    <div className="w-full md:max-w-xl p-4 rounded-xl border flex flex-col md:flex-row gap-4 md:gap-8 m-4 mx-auto">
      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-lg font-bold wrap-break-word">{option.decisionName}</h3>
            <p className="text-sm text-muted-foreground">
              Total Score: {total.toFixed(2)}
            </p>
          </div>
          <span className="md:hidden inline-flex shrink-0 items-center gap-2 rounded-full border border-primary/45 bg-primary/5 text-primary px-3 py-1 text-xs">
            <ChessQueen className="h-2.5 w-2.5" /> Winner!
          </span>
        </div>

        <ul className="text-sm space-y-1 list-disc pl-6">
          {topFactor ? <li>Strong performance in {topFactor.name}</li> : null}
          {mostImportant ? (
            <li>Most important factor: {mostImportant.factorName}</li>
          ) : null}
          {advantage ? <li>Outperformed others in {advantage.name}</li> : null}
        </ul>
      </div>

      <div className="flex-1 text-sm space-y-1 min-w-0">
        <div className="hidden md:flex justify-end">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/45 bg-primary/5 text-primary px-3 py-1 text-xs ml-auto">
            <ChessQueen className="h-2.5 w-2.5" /> Winner!
          </span>
        </div>
        <h3 className="text-md">Math Behind</h3>
        <div>
          {breakdown.map((f) => (
            <div key={f.id} className="flex justify-between gap-1">
              <span className="truncate">
                {f.name}: {f.weight} × {f.rating}
              </span>
              <span className="shrink-0"> = {f.contribution.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t pt-2 font-bold flex justify-between">
          <span>Total</span>
          <span>{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

const Result = () => {
  const searchParams = useSearchParams();
  const urlId = searchParams.get("id");
  const { data: decisions } = useDecisions();

  const currentDecision = useMemo(() => {
    if (!decisions?.length) return null;
    return decisions.find((d) => d.id === urlId) ?? decisions[0] ?? null;
  }, [decisions, urlId]);

  const factors = currentDecision?.factors ?? [];
  const options = currentDecision?.options ?? [];

  const sortedByLargestScore = useMemo(() => sortByScore(options), [options]);
  const winnerOption = sortedByLargestScore[0];

  const scoreboardSortedOptions = useMemo(() => {
    const arr: (DecisionOptions & { num: number })[] = [];
    for (let i = 0; i < sortedByLargestScore.length; i++) {
      if (i % 2 == 0) {
        arr.unshift({ ...sortedByLargestScore[i], num: i + 1 });
      } else {
        arr.push({ ...sortedByLargestScore[i], num: i + 1 });
      }
    }
    return arr;
  }, [sortedByLargestScore]);

  return (
    <Card>
      <CardHeader className="border-b-2">
        <div className="flex flex-row justify-between items-center">
          <CardTitle className="mb-1">Results</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground pt-6">
        <div className="flex gap-2 sm:gap-4 md:gap-8 h-48 justify-center items-end border-b-2 relative">
          {scoreboardSortedOptions.map((o) => {
            const delay = o.num * 0.05;
            return (
              <div
                key={`o_${o.id}`}
                style={{
                  height: `${o.score * 10}%`,
                  minHeight: "16%",
                }}
                className="flex-1 max-w-20 min-w-0 flex flex-col justify-end items-center"
              >
                <h4 className="text-base sm:text-xl font-bold pb-1 leading-3">{o.num}</h4>
                <motion.div
                  initial={{ height: "0%" }}
                  animate={{ height: "100%" }}
                  transition={{ duration: 0.4, delay, ease: "easeOut" }}
                  className="flex flex-col items-center justify-center gap-2 bg-primary text-primary-foreground w-full overflow-hidden text-xs sm:text-sm"
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, delay: delay + 0.4 }}
                  >
                    {o.score} / 10
                  </motion.span>
                </motion.div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2 sm:gap-4 md:gap-8 justify-center items-baseline relative mb-5">
          {scoreboardSortedOptions.map((o) => {
            const delay = o.num * 0.05;
            return (
              <div
                key={`on_${o.id}`}
                className="flex-1 max-w-20 min-w-0 flex flex-col justify-center items-center"
              >
                <motion.h4
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, delay: delay + 0.4 }}
                  className="text-xs sm:text-md font-bold w-full text-center wrap-break-word"
                >
                  {o.decisionName}
                </motion.h4>
              </div>
            );
          })}
        </div>
        <div className="px-4 flex">
          {winnerOption ? (
            <OptionResult
              option={winnerOption}
              factors={factors}
              allOtherOptions={sortedByLargestScore.filter((_, i) => i !== 0)}
            />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default Result;

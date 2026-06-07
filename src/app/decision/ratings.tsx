"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "@uidotdev/usehooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnimatePresence, motion } from "framer-motion";
import { CustomSlider } from "@/components/ui/custom-slider";

import { useDecisions, useUpdateDecision } from "@/hooks/useDecisions";
import { getScore, newId } from "@/lib/decision-utils";
import type { DecisionOptions } from "@/models/Decision";

export const RATING_COLORS = [
  "#ef4444",
  "#f97316",
  "#fb923c",
  "#f59e0b",
  "#eab308",
  "#facc15",
  "#a3e635",
  "#84cc16",
  "#65a30d",
  "#22c55e",
  "#16a34a",
];

function RatingControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const color = RATING_COLORS[value || 0];
  return (
    <div className="flex w-full items-center">
      <div className="flex-1 w-full">
        <CustomSlider
          orientation="horizontal"
          value={value}
          max={10}
          min={0}
          step={1}
          className="w-full"
          indicatorProps={{
            className: "transition-colors duration-300",
            style: { backgroundColor: color },
          }}
          thumbProps={{
            className: "transition-colors duration-300",
            style: {
              borderColor: color,
              backgroundColor: color,
              "--tw-ring-color": color + "80",
            } as React.CSSProperties,
          }}
          onValueChange={(val) => {
            onChange(typeof val === "number" ? val : val[0]);
          }}
        />
      </div>
      <div
        className="flex justify-center items-center text-xs rounded-4xl size-6 text-white mx-2 transition-all duration-300"
        style={{ backgroundColor: color }}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={`r_${value}`}
            initial={{ scale: 0.6, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.6, opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="font-bold tabular-nums"
          >
            {value || 0}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

const Ratings = () => {
  const searchParams = useSearchParams();
  const urlId = searchParams.get("id");
  const { data: decisions } = useDecisions();
  const updateMut = useUpdateDecision();

  const currentDecision = useMemo(() => {
    if (!decisions?.length) return null;
    return decisions.find((d) => d.id === urlId) ?? decisions[0] ?? null;
  }, [decisions, urlId]);

  const factors = currentDecision?.factors ?? [];

  const [options, setLocalOptions] = useState<DecisionOptions[]>(
    currentDecision?.options ?? [],
  );
  const idRef = useRef<string | null>(null);
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (currentDecision && idRef.current !== currentDecision.id) {
      idRef.current = currentDecision.id;
      dirtyRef.current = false;
      setLocalOptions(currentDecision.options);
    }
  }, [currentDecision]);

  const debouncedOptions = useDebounce(options, 400);

  useEffect(() => {
    if (!dirtyRef.current) return;
    if (!currentDecision) return;
    if (idRef.current !== currentDecision.id) return;
    updateMut.mutate({
      id: currentDecision.id,
      patch: { options: debouncedOptions },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedOptions]);

  function setOptions(next: DecisionOptions[]) {
    dirtyRef.current = true;
    setLocalOptions(next);
  }

  function addOption() {
    setOptions([
      ...options,
      {
        id: newId(),
        decisionName: `Option ${options.length + 1}`,
        ratings: {},
        score: 0,
        base10Score: 0,
      },
    ]);
  }

  function updateOption(optionIndex: number, option: DecisionOptions) {
    const tempOptions = Array.from(options);
    option.score = Number(getScore(option, factors).toFixed(2));
    tempOptions[optionIndex] = option;
    setOptions(tempOptions);
  }

  function removeOption(optionIndex: number) {
    setOptions(options.filter((_, i) => i !== optionIndex));
  }

  return (
    <Card>
      <CardHeader className="border-b-2">
        <div className="flex flex-row justify-between items-center">
          <CardTitle className="mb-1">Ratings</CardTitle>
          <Button
            variant="default"
            size={"sm"}
            className="cursor-pointer"
            onClick={addOption}
            disabled={!currentDecision}
          >
            <Plus /> Add an Option
          </Button>
        </div>
        <CardDescription className="text-foreground/75 text-sm w-full md:w-2/3">
          Rate how well these options perform for each factor based on your
          priorities. Higher ratings mean the option better satisfies that
          factor. Ratings 1-10
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground pt-6">
        {factors.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Add factors first to start rating options.
          </p>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Option Name</TableHead>
                    {factors.map((f) => (
                      <TableHead className="capitalize" key={f.id}>
                        {f.factorName}
                      </TableHead>
                    ))}
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {options.map(
                    (
                      { id, decisionName, ratings, score, base10Score },
                      i,
                    ) => (
                      <TableRow key={id} className="min-h-12">
                        <TableCell className="max-w-22">
                          <Field>
                            <Input
                              type="text"
                              placeholder="Option:"
                              value={decisionName}
                              onChange={(e) => {
                                updateOption(i, {
                                  id,
                                  decisionName: e.currentTarget.value,
                                  ratings,
                                  score,
                                  base10Score,
                                });
                              }}
                            />
                          </Field>
                        </TableCell>

                        {factors.map((f) => (
                          <TableCell
                            key={`ratings_${id}_${f.id}`}
                            style={{ width: `${70 / factors.length}%` }}
                          >
                            <RatingControl
                              value={ratings[f.id] || 0}
                              onChange={(val) => {
                                updateOption(i, {
                                  id,
                                  decisionName,
                                  ratings: { ...ratings, [f.id]: val },
                                  score: 0,
                                  base10Score: 0,
                                });
                              }}
                            />
                          </TableCell>
                        ))}
                        <TableCell className="w-12">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive/80 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                            onClick={() => removeOption(i)}
                          >
                            <Trash2 />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="md:hidden space-y-4">
              {options.map(
                ({ id, decisionName, ratings, score, base10Score }, i) => (
                  <div
                    key={id}
                    className="rounded-xl border p-4 space-y-3 bg-card"
                  >
                    <div className="flex items-center gap-2">
                      <Field className="flex-1">
                        <Input
                          type="text"
                          placeholder="Option:"
                          value={decisionName}
                          onChange={(e) => {
                            updateOption(i, {
                              id,
                              decisionName: e.currentTarget.value,
                              ratings,
                              score,
                              base10Score,
                            });
                          }}
                        />
                      </Field>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-destructive/80 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                        onClick={() => removeOption(i)}
                      >
                        <Trash2 />
                      </Button>
                    </div>

                    <div className="space-y-3 pt-1">
                      {factors.map((f) => (
                        <div
                          key={`m_${id}_${f.id}`}
                          className="flex flex-col gap-1"
                        >
                          <span className="text-xs font-medium tracking-wide text-muted-foreground capitalize">
                            {f.factorName}
                          </span>
                          <RatingControl
                            value={ratings[f.id] || 0}
                            onChange={(val) => {
                              updateOption(i, {
                                id,
                                decisionName,
                                ratings: { ...ratings, [f.id]: val },
                                score: 0,
                                base10Score: 0,
                              });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Ratings;

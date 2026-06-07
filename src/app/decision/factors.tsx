"use client";

import { Alert, AlertTitle } from "@/components/ui/alert";
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
import { Slider } from "@/components/ui/slider";
import { AlertTriangleIcon, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "@uidotdev/usehooks";
import { AnimatePresence, motion } from "framer-motion";

import { useDecisions, useUpdateDecision } from "@/hooks/useDecisions";
import { newId } from "@/lib/decision-utils";
import type { DecisionFactor } from "@/models/Decision";

const Factors = () => {
  const searchParams = useSearchParams();
  const urlId = searchParams.get("id");
  const { data: decisions } = useDecisions();
  const updateMut = useUpdateDecision();

  const currentDecision = useMemo(() => {
    if (!decisions?.length) return null;
    return (
      decisions.find((d) => d.id === urlId) ?? decisions[0] ?? null
    );
  }, [decisions, urlId]);

  const [factors, setLocalFactors] = useState<DecisionFactor[]>(
    currentDecision?.factors ?? [],
  );
  const idRef = useRef<string | null>(null);
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (currentDecision && idRef.current !== currentDecision.id) {
      idRef.current = currentDecision.id;
      dirtyRef.current = false;
      setLocalFactors(currentDecision.factors);
    }
  }, [currentDecision]);

  const debouncedFactors = useDebounce(factors, 400);

  useEffect(() => {
    if (!dirtyRef.current) return;
    if (!currentDecision) return;
    if (idRef.current !== currentDecision.id) return;
    updateMut.mutate({
      id: currentDecision.id,
      patch: { factors: debouncedFactors },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFactors]);

  const [weightExceededRemaining, setWeightExceededRemaining] =
    useState<number>(0);
  const debouncedWeightExceeded = useDebounce(weightExceededRemaining, 3500);

  useEffect(() => {
    if (debouncedWeightExceeded > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWeightExceededRemaining(0);
    }
  }, [debouncedWeightExceeded]);

  const remainingWeight = useMemo(
    () => 1 - factors.reduce((sum, f) => sum + f.factorWeight, 0),
    [factors],
  );

  function setFactors(next: DecisionFactor[]) {
    dirtyRef.current = true;
    setLocalFactors(next);
  }

  function addFactor() {
    setFactors([
      ...factors,
      {
        id: newId(),
        factorName: `Factor ${factors.length + 1}`,
        factorWeight: 0,
      },
    ]);
  }

  function updateFactor(factorIndex: number, factor: DecisionFactor) {
    const tempFactors = Array.from(factors);
    tempFactors[factorIndex] = factor;
    setFactors(tempFactors);
  }

  function removeFactor(factorIndex: number) {
    setFactors(factors.filter((_, i) => i !== factorIndex));
  }

  return (
    <Card>
      <CardHeader className="border-b-2">
        <div className="flex flex-row justify-between items-center">
          <CardTitle className="mb-1">Factors</CardTitle>
          <Button
            variant="default"
            size={"sm"}
            className="cursor-pointer"
            onClick={addFactor}
            disabled={!currentDecision}
          >
            <Plus /> Add a Factor{" "}
          </Button>
        </div>
        <CardDescription className="text-foreground/75 text-sm w-full md:w-2/3">
          What aspects of this decision are important to you? try to write them
          down and specify how much they&apos;re important to you by giving them
          a weight from 0-1
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground pt-6">
        {factors.length > 0 ? (
          <div className="hidden md:flex w-full md:w-3/4 items-center gap-4 mx-auto mb-4">
            <span className="w-1/2 text-center">Factor name</span>
            <span className="w-1/2 text-center">Weight</span>
          </div>
        ) : null}

        {weightExceededRemaining > 0 ? (
          <Alert className="max-w-md mx-auto mb-4 border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
            <AlertTriangleIcon />
            <AlertTitle>
              Please decrease the other weights of the factor to increase this
              weight{" "}
            </AlertTitle>
          </Alert>
        ) : null}

        {factors.map(({ id, factorName, factorWeight }, i) => (
          <div
            className="w-full md:w-3/4 flex flex-col md:flex-row items-stretch md:items-center justify-center gap-2 mx-auto mb-4 md:mb-2"
            key={id}
          >
            <Field className="w-full md:w-auto md:flex-1">
              <Input
                type="text"
                placeholder="ّFactor :"
                value={factorName}
                onChange={(e) => {
                  updateFactor(i, {
                    id,
                    factorName: e.currentTarget.value,
                    factorWeight,
                  });
                }}
              />
            </Field>
            <div className="flex items-center gap-2 w-full md:flex-1">
              <Slider
                orientation="horizontal"
                value={factorWeight}
                max={1}
                step={0.01}
                className="w-full flex-1"
                onValueChange={(val) => {
                  const max = factorWeight + remainingWeight;
                  let w = typeof val === "number" ? val : val[0];
                  if (w > max)
                    setWeightExceededRemaining(weightExceededRemaining + 1);
                  w = Math.round((w <= max ? w : max) * 100) / 100;
                  updateFactor(i, {
                    id,
                    factorName,
                    factorWeight: w,
                  });
                }}
              />
              <div
                className={`shrink-0 flex justify-center items-center text-xs w-14 sm:w-19 h-8 rounded-4xl text-white transition-all duration-300 bg-primary`}
              >
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={factorWeight}
                    initial={{ scale: 0.6, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.6, opacity: 0, y: -10 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    className="font-bold tabular-nums"
                  >
                    <span>{factorWeight || 0}</span>
                  </motion.span>
                </AnimatePresence>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 text-destructive/80 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                onClick={() => removeFactor(i)}
              >
                <Trash2 />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default Factors;

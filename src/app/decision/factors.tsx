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
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { DecisionFactor, useDecisionMatrixStore } from "@/store/useAppStore";
import { AnimatePresence, motion } from "framer-motion";

const Factors = () => {
  const { factors, setFactors } = useDecisionMatrixStore();
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

  function addFactor() {
    setFactors([
      ...factors,
      {
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
    setFactors([...factors.filter((f, i) => i !== factorIndex)]);
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
          >
            <Plus /> Add a Factor{" "}
          </Button>
        </div>
        <CardDescription className="text-foreground/75 text-sm w-2/3">
          What aspects of this decision are important to you? try to write them
          down and specify how much they&apos;re important to you by giving them
          a weight from 0-1
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground pt-6">
        {factors.length > 0 ? (
          <div className="w-3/4 flex items-center gap-4 mx-auto mb-4">
            <span className="w-1/2 text-center">Factor name</span>
            <span className="w-1/2 text-center">Weight</span>
          </div>
        ) : (
          <></>
        )}

        {weightExceededRemaining > 0 ? (
          <Alert className="max-w-md mx-auto mb-4 border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
            <AlertTriangleIcon />
            <AlertTitle>
              Please decrease the other weights of the factor to increase this
              weight{" "}
            </AlertTitle>
          </Alert>
        ) : (
          <></>
        )}

        {factors.map(({ factorName, factorWeight }, i) => (
          <div
            className="w-3/4 flex items-center justify-center gap-2 mx-auto mb-2"
            key={i}
          >
            <Field>
              <Input
                type="text"
                placeholder="ّFactor :"
                value={factorName}
                onChange={(e) => {
                  updateFactor(i, {
                    factorName: e.currentTarget.value,
                    factorWeight,
                  });
                }}
              />
            </Field>
            <Slider
              orientation="horizontal"
              value={factorWeight}
              max={1}
              step={0.01}
              className="w-full"
              onValueChange={(val) => {
                const max = factorWeight + remainingWeight;
                let w = typeof val === "number" ? val : val[0];
                if (w > max)
                  setWeightExceededRemaining(weightExceededRemaining + 1);
                w = Math.round((w <= max ? w : max) * 100) / 100;
                updateFactor(i, {
                  factorName,
                  factorWeight: w,
                });
              }}
            />
            <div
              className={`flex justify-center items-center text-xs w-19 h-8 rounded-4xl text-white transition-all duration-300 bg-primary`}
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
              className="text-destructive/80 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
              onClick={() => removeFactor(i)}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default Factors;

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
import { Plus, Trash2 } from "lucide-react";
import {
  DecisionFactor,
  DecisionOptions,
  getScore,
  useDecisionMatrixStore,
} from "@/store/useAppStore";
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
import { useEffect } from "react";

const RATING_COLORS = [
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

const Ratings = () => {
  const { factors, options, winnerOption, setOptions } =
    useDecisionMatrixStore();

  useEffect(() => {
    console.log(options, winnerOption);
  }, [options, winnerOption]);

  function addOption() {
    setOptions([
      ...options,
      {
        decisionName: `Option ${options.length + 1}`,
        ratings: {},
        score: 0,
        base10Score: 0,
      },
    ]);
  }

  function updateOption(optionIndex: number, option: DecisionOptions) {
    const tempOptions = Array.from(options);
    option.score = getScore(option, factors);
    tempOptions[optionIndex] = option;
    setOptions(tempOptions);
  }

  function removeOption(optionIndex: number) {
    setOptions([...options.filter((f, i) => i !== optionIndex)]);
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
          >
            <Plus /> Add a Options{" "}
          </Button>
        </div>
        <CardDescription className="text-foreground/75 text-sm w-2/3">
          Rate how well these options perform for each factor based on your
          priorities. Higher ratings mean the option better satisfies that
          factor. Ratings 1-10
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground pt-6">
        {factors.length > 0 ? (
          <Table className="overflow-hidden">
            <TableHeader>
              <TableRow>
                <TableHead>Option Name</TableHead>
                {factors.map((f, i) => (
                  <TableHead className="capitalize" key={i}>
                    {f.factorName}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {options.map(
                ({ decisionName, ratings, score, base10Score }, i) => (
                  <TableRow key={i} className="min-h-12">
                    <TableCell className="max-w-22">
                      <Field>
                        <Input
                          type="text"
                          placeholder="ّFactor :"
                          value={decisionName}
                          onChange={(e) => {
                            updateOption(i, {
                              decisionName: e.currentTarget.value,
                              ratings,
                              score,
                              base10Score,
                            });
                          }}
                        />
                      </Field>
                    </TableCell>

                    {factors.map((f, j) => (
                      <TableCell
                        key={`ratings_${i}_${j}`}
                        style={{
                          width: `${70 / factors.length}%`,
                        }}
                      >
                        <div className="flex w-full items-center">
                          <div className="flex-1 w-full">
                            <CustomSlider
                              orientation="horizontal"
                              value={options[i].ratings[j]}
                              max={10}
                              min={0}
                              step={1}
                              className="w-full"
                              indicatorProps={{
                                className: "transition-colors duration-300",
                                style: {
                                  backgroundColor:
                                    RATING_COLORS[options[i].ratings[j] || 0],
                                },
                              }}
                              thumbProps={{
                                className: "transition-colors duration-300",
                                style: {
                                  borderColor:
                                    RATING_COLORS[options[i].ratings[j] || 0],
                                  backgroundColor:
                                    RATING_COLORS[options[i].ratings[j] || 0],
                                  "--tw-ring-color":
                                    RATING_COLORS[options[i].ratings[j] || 0] +
                                    "80",
                                } as React.CSSProperties,
                              }}
                              onValueChange={(val) => {
                                updateOption(i, {
                                  decisionName,
                                  ratings: {
                                    ...options[i].ratings,
                                    [j]: typeof val === "number" ? val : val[0],
                                  },
                                  score: 0,
                                  base10Score: 0,
                                });
                              }}
                            />
                          </div>
                          <div
                            className={`flex justify-center items-center text-xs rounded-4xl size-6 text-white mx-2 transition-all duration-300`}
                            style={{
                              backgroundColor:
                                RATING_COLORS[options[i].ratings[j] || 0],
                            }}
                          >
                            <AnimatePresence mode="popLayout">
                              <motion.span
                                key={`r_${options[i].ratings[j]}`}
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
                                {options[i].ratings[j] || 0}
                              </motion.span>
                            </AnimatePresence>
                          </div>
                        </div>
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
        ) : (
          <></>
        )}
      </CardContent>
    </Card>
  );
};

export default Ratings;

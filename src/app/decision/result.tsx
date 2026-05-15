import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDecisionMatrixStore } from "@/store/useAppStore";
import { ChessQueen, Info } from "lucide-react";
import { useMemo } from "react";

const Result = () => {
  const { factors, options, sortedByLargestScore, winnerOption } =
    useDecisionMatrixStore();

  const { scoreboardSortedOptions } = useMemo(() => {
    const scoreboardSortedOptions = [];
    for (let i = 0; i < sortedByLargestScore.length; i++) {
      if (i % 2 == 0) {
        scoreboardSortedOptions.unshift(sortedByLargestScore[i]);
      } else {
        scoreboardSortedOptions.push(sortedByLargestScore[i]);
      }
    }

    return {
      scoreboardSortedOptions,
    };
  }, [options]);

  return (
    <Card>
      <CardHeader className="border-b-2">
        <div className="flex flex-row justify-between items-center">
          <CardTitle className="mb-1">Results</CardTitle>
        </div>
        {/* <CardDescription className="text-foreground/75 text-sm w-2/3">
          Rate how well these options perform for each factor based on your
          priorities. Higher ratings mean the option better satisfies that
          factor. Ratings 1-10
        </CardDescription> */}
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground pt-6">
        <div className="flex gap-6 h-48 justify-center items-end">
          {scoreboardSortedOptions.map((o, i) => {
            return (
              <div
                key={`o_${o.decisionName}_${i}`}
                style={{
                  height: `${o.score * 10}%`,
                }}
                className="flex flex-col justify-end items-center"
              >
                <h4 className="text-md font-bold">{o.decisionName}</h4>

                <div className="flex flex-col items-center justify-center gap-2 bg-primary text-primary-foreground p-2 h-full w-full">
                  {winnerOption?.score === o.score &&
                  winnerOption.decisionName === o.decisionName ? (
                    <ChessQueen className="mx-auto size-8" />
                  ) : (
                    <></>
                  )}

                  <span>{o.score} / 10</span>
                </div>
              </div>
            );
          })}
        </div>

      </CardContent>
    </Card>
  );
};

export default Result;

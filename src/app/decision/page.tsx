"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ExternalLinkIcon,
  ListTodo,
  PencilIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { Suspense, useCallback, useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import Factors from "@/app/decision/factors";
import Ratings from "@/app/decision/ratings";
import Result from "@/app/decision/result";
import {
  useCreateDecision,
  useDecisions,
  useDeleteDecision,
  useUpdateDecision,
} from "@/hooks/useDecisions";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Decision } from "@/models/Decision";

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

function EditDecisionDialog({
  decision,
  onClose,
}: {
  decision: Decision | null;
  onClose: () => void;
}) {
  const updateMut = useUpdateDecision();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lastDecisionId, setLastDecisionId] = useState<string | null>(null);

  if (decision && decision.id !== lastDecisionId) {
    setLastDecisionId(decision.id);
    setTitle(decision.title ?? "");
    setDescription(decision.description ?? "");
  }

  async function save() {
    if (!decision) return;
    try {
      await updateMut.mutateAsync({
        id: decision.id,
        patch: { title, description },
      });
      toast.success("Decision updated.");
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <Dialog open={!!decision} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit decision</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Title</label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
              placeholder="Decision title"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">
              Description (optional)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              placeholder="What's this decision about?"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={updateMut.isPending}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={save}
            disabled={updateMut.isPending}
            className="cursor-pointer"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDecisionDialog({
  decision,
  onClose,
  onDeleted,
}: {
  decision: Decision | null;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const deleteMut = useDeleteDecision();

  async function confirmDelete() {
    if (!decision) return;
    try {
      await deleteMut.mutateAsync(decision.id);
      onDeleted(decision.id);
      toast.success("Decision deleted.");
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <AlertDialog open={!!decision} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete decision?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete &quot;
            {decision?.title || "Untitled Decision"}&quot;. This cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={deleteMut.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={confirmDelete}
            disabled={deleteMut.isPending}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const DecisionPageInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const isAuthed = status === "authenticated";

  const [tab, setTab] = useState<TabKey>(TabsKeys[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: decisions, isLoading } = useDecisions();
  const createMut = useCreateDecision();

  const urlId = searchParams.get("id");
  const currentDecision = useMemo<Decision | null>(
    () => decisions?.find((d) => d.id === urlId) ?? null,
    [decisions, urlId],
  );

  const selectDecision = useCallback(
    (id: string) => {
      const sp = new URLSearchParams(searchParams.toString());
      sp.set("id", id);
      router.replace(`?${sp.toString()}`);
    },
    [router, searchParams],
  );

  const clearSelection = useCallback(() => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("id");
    router.replace(sp.toString() ? `?${sp.toString()}` : "?");
  }, [router, searchParams]);

  async function handleCreateDecision() {
    const d = await createMut.mutateAsync({ title: "Untitled Decision" });
    setEditingId(d.id);
  }

  function handleDeleted(id: string) {
    if (urlId === id) clearSelection();
    setTab(TabsKeys[0]);
  }

  const editingDecision = useMemo<Decision | null>(
    () => decisions?.find((d) => d.id === editingId) ?? null,
    [decisions, editingId],
  );
  const deletingDecision = useMemo<Decision | null>(
    () => decisions?.find((d) => d.id === deletingId) ?? null,
    [decisions, deletingId],
  );

  const CurrentTabContent = TabContents[tab];

  if (!isAuthed) {
    return (
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">Sign in required</h1>
        <p className="text-muted-foreground">
          Sign in to create and save decisions.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-start gap-6"
      >
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex gap-2 items-center">
          <ListTodo className="h-7 w-7 sm:h-8 sm:w-8" /> Decision Making Matrix
        </h1>
        <p className="w-full md:w-3/4">
          This tool helps you compare choices using simple math. First, set how
          important each factor is (weight), then rate how well each option
          performs. We multiply importance × rating for every factor, then add
          the results. The option with the highest total is the best match for
          your priorities.
        </p>
        <span>
          Weight = how much a factor matters to you
          <br />
          Rating = how good this option performs in a certain factor
        </span>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-10 md:mt-16"
      >
        {!currentDecision ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your decisions</h2>
              <Button
                onClick={handleCreateDecision}
                disabled={createMut.isPending}
                className="cursor-pointer"
              >
                <Plus /> New decision
              </Button>
            </div>

            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-12">
                Loading…
              </p>
            ) : !decisions || decisions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">
                No decisions yet. Click <strong>New decision</strong> to create
                one.
              </p>
            ) : (
              <div className="w-full grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-8">
                {decisions.map((decision) => (
                  <Card
                    key={decision.id}
                    className="h-full overflow-hidden hover:-translate-y-1 transition-all duration-300"
                  >
                    <AspectRatio ratio={1}>
                      <CardContent className="flex flex-col gap-1 p-3 h-full relative group">
                        <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                          <ListTodo className="size-3" />
                          Decision
                        </span>
                        <h3 className="font-semibold line-clamp-1">
                          {decision.title || "Untitled Decision"}
                        </h3>
                        <p className="line-clamp-2 text-muted-foreground text-sm">
                          {decision.description}
                        </p>
                        <div className="mt-auto flex justify-end gap-2">
                          <Button
                            className="size-10 sm:size-7 rounded-4xl p-0 cursor-pointer"
                            onClick={() => selectDecision(decision.id)}
                            title="Open"
                          >
                            <ExternalLinkIcon className="size-4!" />
                          </Button>
                          <Button
                            className="size-10 sm:size-7 rounded-4xl p-0 cursor-pointer"
                            variant="secondary"
                            onClick={() => setEditingId(decision.id)}
                            title="Edit"
                          >
                            <PencilIcon className="size-4!" />
                          </Button>
                          <Button
                            className="size-10 sm:size-7 rounded-4xl p-0 cursor-pointer"
                            variant="destructive"
                            onClick={() => setDeletingId(decision.id)}
                            title="Delete"
                          >
                            <Trash2 className="size-4!" />
                          </Button>
                        </div>
                      </CardContent>
                    </AspectRatio>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="cursor-pointer shrink-0 self-start"
              >
                <ChevronLeft /> Back
              </Button>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold tracking-tight line-clamp-1">
                  {currentDecision.title || "Untitled Decision"}
                </h2>
                {currentDecision.description ? (
                  <p className="text-muted-foreground text-sm mt-1 line-clamp-3">
                    {currentDecision.description}
                  </p>
                ) : null}
              </div>
              <div className="flex gap-2 sm:ml-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingId(currentDecision.id)}
                  className="cursor-pointer"
                >
                  <PencilIcon /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingId(currentDecision.id)}
                  className="text-destructive/80 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                >
                  <Trash2 /> Delete
                </Button>
              </div>
            </div>

            <div className="mb-24">
              <Tabs
                value={tab}
                onValueChange={(v) => setTab(v as TabKey)}
                className="flex flex-col"
              >
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
          </>
        )}
      </motion.div>

      <EditDecisionDialog
        decision={editingDecision}
        onClose={() => setEditingId(null)}
      />
      <DeleteDecisionDialog
        decision={deletingDecision}
        onClose={() => setDeletingId(null)}
        onDeleted={handleDeleted}
      />
    </section>
  );
};

const DecisionPage = () => (
  <Suspense fallback={null}>
    <DecisionPageInner />
  </Suspense>
);

export default DecisionPage;

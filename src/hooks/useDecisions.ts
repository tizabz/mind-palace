"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as api from "@/lib/decisionsApi";
import type { Decision } from "@/models/Decision";

export type DecisionPatch = Partial<
  Pick<Decision, "title" | "description" | "factors" | "options">
>;

export const decisionsKeys = {
  all: ["decisions"] as const,
  list: () => [...decisionsKeys.all, "list"] as const,
};

export function useDecisions() {
  return useQuery({
    queryKey: decisionsKeys.list(),
    queryFn: api.listDecisions,
  });
}

export function useCreateDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; description?: string }) =>
      api.createDecision(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: decisionsKeys.list() }),
  });
}

export function useUpdateDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: DecisionPatch }) =>
      api.updateDecision(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: decisionsKeys.list() }),
  });
}

export function useDeleteDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteDecision(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: decisionsKeys.list() }),
  });
}

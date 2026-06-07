import { request } from "@/lib/apiCaller";
import type { Decision } from "@/models/Decision";

type ListResponse = { decisions: Decision[] };
type OneResponse = { decision: Decision };

export async function listDecisions(): Promise<Decision[]> {
  const data = await request<ListResponse>({
    url: "/api/decisions",
    method: "GET",
  });
  return data.decisions;
}

export async function getDecision(id: string): Promise<Decision> {
  const data = await request<OneResponse>({
    url: `/api/decisions/${id}`,
    method: "GET",
  });
  return data.decision;
}

export async function createDecision(input: {
  title: string;
  description?: string;
}): Promise<Decision> {
  const data = await request<OneResponse>({
    url: "/api/decisions",
    method: "POST",
    data: input,
  });
  return data.decision;
}

export async function updateDecision(
  id: string,
  patch: Partial<
    Pick<Decision, "title" | "description" | "factors" | "options">
  >,
): Promise<Decision> {
  const data = await request<OneResponse>({
    url: `/api/decisions/${id}`,
    method: "PUT",
    data: patch,
  });
  return data.decision;
}

export async function deleteDecision(id: string): Promise<void> {
  await request<{ ok: true }>({
    url: `/api/decisions/${id}`,
    method: "DELETE",
  });
}

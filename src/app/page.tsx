"use client";

import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";

export default function Home() {
  const trpc = useTRPC();
  const invoke = useMutation(trpc.invoke.mutationOptions({}));

  return (
    <>
      <div className="p-4">
        <Button onClick={() => invoke.mutate({ text: "Devansh" })}>
          Invoke Background Jobs
        </Button>
      </div>
    </>
  );
}

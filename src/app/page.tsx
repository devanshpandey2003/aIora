"use client";
import { useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Home() {
  const [value, setValue] = useState("");

  const trpc = useTRPC();

  const { data: messages } = useQuery(trpc.message.getMany.queryOptions());
  const createMessage = useMutation(
    trpc.message.create.mutationOptions({
      onSuccess: () => {
        toast("message created!");
      },
    })
  );

  return (
    <>
      <div className="p-4">
        <Input value={value} onChange={(e) => setValue(e.target.value)} />
        <Button onClick={() => createMessage.mutate({ value: value })}>
          Invoke Background Jobs
        </Button>
        {JSON.stringify(messages, null, 2)}
      </div>
    </>
  );
}

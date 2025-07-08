"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useMutation, useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Home() {
  const router = useRouter();

  const [value, setValue] = useState("");

  const trpc = useTRPC();

  //  const { data: messages } = useQuery(trpc.message.getMany.queryOptions());
  const createProjects = useMutation(
    trpc.projects.create.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: (data) => {
        router.push(`/projects/${data.id}`);
        toast.success("Project created successfully");
      },
    })
  );

  return (
    <div className="h-screen flex items-cneter justify-center">
      <div className="flex max-w-7xl mx-auto items-center flex-col gap-y-4 justify-center">
        <Input value={value} onChange={(e) => setValue(e.target.value)} />
        <Button
          disabled={createProjects.isPending || !value}
          onClick={() => createProjects.mutate({ value: value })}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}

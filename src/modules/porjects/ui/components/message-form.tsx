import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextareaAutosize from "react-textarea-autosize";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { Form, FormField } from "@/components/ui/form";
import { Usage } from "./usage";
import { useTier } from "@/hooks/use-context";

interface Props {
  projectId: string;
}

const messageFormSchema = z.object({
  value: z
    .string()
    .min(1, { message: "Value cannot be empty" })
    .max(10000, { message: "Value cannot exceed 10000 characters" }),
});

export const MessageForm = ({ projectId }: Props) => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const { tier } = useTier();
  const { data: usage } = useQuery(trpc.usage.status.queryOptions());

  const form = useForm<z.infer<typeof messageFormSchema>>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      value: "",
    },
    mode: "onChange", // Enable real-time validation
  });

  const createMessage = useMutation(
    trpc.messages.create.mutationOptions({
      onSuccess: () => {
        form.reset();
        queryClient.invalidateQueries(
          trpc.messages.getMany.queryOptions({ projectId })
        );
        toast.success("Message sent successfully!");
      },

      onError: (error) => {
        console.error("Error sending message:", error);
        toast.error(error.message || "Failed to send message");
      },
    })
  );

  const [isFocused, setIsFocused] = useState(false);
  const showUsage = true;
  const isPending = createMessage.isPending;
  const watchedValue = form.watch("value");
  const isDisabled =
    isPending || !watchedValue?.trim() || watchedValue.length === 0;

  const onSubmit = async (values: z.infer<typeof messageFormSchema>) => {
    if (!values.value.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      await createMessage.mutateAsync({
        projectId,
        value: values.value.trim(),
      });
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  return (
    <div className="w-full px-4 py-3">
      <Form {...form}>
        {tier === "free" ? (
          <div className="mb-2 text-xs text-blue-500">
            You are using the free tier.
          </div>
        ) : (
          showUsage &&
          usage && (
            <Usage
              point={usage.remainingPoints}
              msBeforeNext={usage.msBeforeNext}
            />
          )
        )}

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn(
            "relative border-2 p-4 pt-3 rounded-2xl text-sm bg-white dark:bg-gray-800 transition-all duration-300 shadow-sm",
            isFocused &&
              "shadow-lg border-blue-300 dark:border-blue-600 ring-2 ring-blue-100 dark:ring-blue-900",
            !isFocused && "border-gray-200 dark:border-gray-700",
            showUsage && "rounded-t-none",
            isPending && "opacity-75"
          )}
        >
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <TextareaAutosize
                {...field}
                disabled={isPending}
                placeholder="What would you like to build? Share your ideas..."
                className={cn(
                  "w-full pt-2 pb-2 resize-none border-none bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 leading-relaxed",
                  isPending && "cursor-not-allowed"
                )}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                minRows={2}
                maxRows={8}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)(e);
                  }
                }}
              />
            )}
          />

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 mt-2">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 text-[10px] text-gray-600 dark:text-gray-400 font-mono inline-flex items-center gap-1">
                <span>⌘</span>
                <span>Enter</span>
              </kbd>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                to send
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                {watchedValue?.length || 0}/10000
              </span>
              <Button
                type="submit"
                disabled={isDisabled}
                size="sm"
                className={cn(
                  "size-9 rounded-full p-0 transition-all duration-300",
                  isDisabled
                    ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
                    : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                )}
              >
                {isPending ? (
                  <Loader2Icon className="animate-spin size-4" />
                ) : (
                  <ArrowUpIcon className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

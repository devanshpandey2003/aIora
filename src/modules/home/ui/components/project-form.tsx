import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextareaAutosize from "react-textarea-autosize";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { Form, FormField } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { PROJECT_TEMPLATES } from "../../constant";

const messageFormSchema = z.object({
  value: z
    .string()
    .min(1, { message: "Value cannot be empty" })
    .max(10000, { message: "Value cannot exceed 10000 characters" }),
});

export const ProjectFrom = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const form = useForm<z.infer<typeof messageFormSchema>>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      value: "",
    },
    mode: "onChange", // Enable real-time validation
  });

  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.projects.getMany.queryOptions());
        router.push(`/projects/${data.id}`);
        toast.success("Project created successfully!");
      },

      onError: (error) => {
        console.error("Error sending message:", error);
        toast.error("Failed to send message. Please try again.");
      },
    })
  );

  const [isFocused, setIsFocused] = useState(false);
  const isPending = createProject.isPending;
  const watchedValue = form.watch("value");
  const isDisabled =
    isPending || !watchedValue?.trim() || watchedValue.length === 0;

  const onSubmit = async (values: z.infer<typeof messageFormSchema>) => {
    if (!values.value.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      await createProject.mutateAsync({
        value: values.value.trim(),
      });
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const onSelect = (value: string) => {
    form.setValue("value", value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-3">
      <Form {...form}>
        <section className="spcae-y-6">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn(
              "relative border-2 p-6 pt-4 rounded-3xl text-sm bg-card/80 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl",
              isFocused &&
                "shadow-2xl border-primary/30 ring-4 ring-primary/10 scale-[1.02]",
              !isFocused && "border-border/50 hover:border-border",
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
                    "w-full pt-2 pb-2 resize-none border-none bg-transparent outline-none placeholder:text-muted-foreground/60 text-foreground leading-relaxed text-base",
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

            <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-2">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-muted/60 rounded-md border border-border text-[10px] text-muted-foreground font-mono inline-flex items-center gap-1">
                  <span>⌘</span>
                  <span>Enter</span>
                </kbd>
                <span className="text-[10px] text-muted-foreground">
                  to send
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground">
                  {watchedValue?.length || 0}/10000
                </span>
                <Button
                  type="submit"
                  disabled={isDisabled}
                  size="sm"
                  className={cn(
                    "size-10 rounded-full p-0 transition-all duration-300",
                    isDisabled
                      ? "bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted"
                      : "bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 ring-2 ring-primary/20"
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
          <div className="hidden md:flex flex-wrap justify-center gap-3 max-w-4xl mx-auto mt-6 items-center">
            {PROJECT_TEMPLATES.map((template) => (
              <Button
                key={template.title}
                variant="outline"
                size="sm"
                className="bg-card/60 backdrop-blur-sm border-border/60 hover:bg-accent/80 hover:border-accent-foreground/20 transition-all duration-300 hover:scale-105 hover:shadow-md"
                onClick={() => onSelect(template.prompt)}
              >
                <span className="mr-2">{template.emoji}</span>
                {template.title}
              </Button>
            ))}
          </div>
        </section>
      </Form>
    </div>
  );
};

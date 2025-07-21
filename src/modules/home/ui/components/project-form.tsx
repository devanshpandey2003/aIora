import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextareaAutosize from "react-textarea-autosize";
import { ArrowUpIcon, Loader2Icon, SparklesIcon, ZapIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { Form, FormField } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { PROJECT_TEMPLATES } from "../../constant";
import { useClerk } from "@clerk/nextjs";
import { useTier } from "@/hooks/use-context"; // Import the tier context

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
  const clerk = useClerk();
  const { tier, setTier } = useTier(); // Get tier state and setter from context

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
        toast.error(error.message);

        if (error.data?.code === "UNAUTHORIZED") {
          router.push("/sign-in");
          return;
        }
      },
    })
  );

  const [isFocused, setIsFocused] = useState(false);
  // Remove local selectedTier state since we're using context
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
        tier: tier, // Use tier from context
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
    <div className="w-full max-w-4xl mx-auto px-2 ">
      {/* Tier Selection - now uses context */}
      <div className="mb-3 flex justify-center">
        <div className="inline-flex bg-muted/50 p-1 rounded-2xl border border-border/50 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setTier("free")}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300",
              tier === "free"
                ? "bg-background shadow-lg text-foreground border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ZapIcon className="size-4" />
            Free
          </button>
          <button
            type="button"
            onClick={() => setTier("premium")}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300",
              tier === "premium"
                ? "bg-background shadow-lg text-foreground border border-border/50"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <SparklesIcon className="size-4" />
            Premium
          </button>
        </div>
      </div>

      {/* Tier Information */}
      <div className="mb-6 text-center">
        <div className="text-sm text-muted-foreground">
          {tier === "free" ? (
            <div className="flex items-center justify-center gap-2">
              <span>
                🚀 Unlimited request with Quick updates to HTML, CSS, JS files
              </span>
              <span className="text-xs bg-muted px-2 py-1 rounded-full">
                Perfect for simple projects
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>
                ⚡ Limited request for Next.js apps with advanced features, pro
                version available.
              </span>
              <span className="text-xs bg-muted px-2 py-1 rounded-full">
                Production-ready applications
              </span>
            </div>
          )}
        </div>
      </div>

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
          <div className="hidden md:flex flex-wrap justify-center gap-2 max-w-3xl mx-auto mt-6 items-center">
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

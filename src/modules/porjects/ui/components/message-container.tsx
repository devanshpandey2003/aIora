import { useEffect, useRef, useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MessageForm } from "./message-form";
import { MessageCard } from "./messge-card";
import { Fragment } from "@/generated/prisma/client";
import { Card } from "@/components/ui/card";
import { Loader2Icon } from "lucide-react";
import Image from "next/image";

interface MessageContainerProps {
  projectId: string;
  activeFragment: Fragment | null;
  setActiveFragment: (fragment: Fragment | null) => void;
}

const LoadingMessage = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const loadingMessages = [
    "Analyzing your request...",
    "Thinking...",
    "Generating response...",
    "Crafting components...",
    "Processing your idea...",
    "Building your solution...",
    "Almost ready...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(interval);
  }, [loadingMessages.length]);

  return (
    <div className="pb-6 pr-2 pl-2 group">
      <div className="flex items-start gap-2 max-w-[85%]">
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm">
              <Image
                src="/logo.svg"
                alt="alora"
                width={12}
                height={12}
                className="shrink-0"
              />
            </div>
            <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
              Alora
            </span>
            <span className="text-xs text-muted-foreground ml-auto">
              Working...
            </span>
          </div>
          <Card className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Loader2Icon className="size-4 animate-spin text-blue-600 dark:text-blue-400" />
              <div className="flex flex-col gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full animate-pulse"></div>
                  <div
                    className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 transition-all duration-500">
                  {loadingMessages[currentMessageIndex]}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const MessageContainer = ({
  projectId,
  activeFragment,
  setActiveFragment,
}: MessageContainerProps) => {
  const trpc = useTRPC();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: messages } = useSuspenseQuery(
    trpc.messages.getMany.queryOptions({
      projectId: projectId,
    })
  );

  // Track when a user message is sent but no assistant response yet
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "USER") {
      setIsGenerating(true);
    } else {
      setIsGenerating(false);
    }
  }, [messages]);

  useEffect(() => {
    const lastAssitantMessage = messages.findLast(
      (message) => message.role === "ASSISTANT"
    );

    if (lastAssitantMessage) {
      setActiveFragment(lastAssitantMessage.fragments); /* TODO */
    }
  }, [messages, setActiveFragment]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, isGenerating]);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto">
        <div className="pt-4 pb-2 px-2">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-gray-400 dark:text-gray-600 text-lg mb-2">
                  💬
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Start a conversation to begin building
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageCard
                  key={message.id}
                  content={message.content}
                  role={message.role}
                  fragment={message.fragments}
                  createdAt={message.createdAt}
                  isActiveFragment={
                    activeFragment?.id === message.fragments?.id
                  }
                  onFragmentClick={() => setActiveFragment(message.fragments)}
                  type={message.type}
                />
              ))}
              {isGenerating && <LoadingMessage />}
            </>
          )}
          <div ref={bottomRef} className="h-12" />
        </div>
      </div>

      <MessageForm projectId={projectId} />
    </div>
  );
};

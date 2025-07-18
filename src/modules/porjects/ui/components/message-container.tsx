import { useEffect, useRef } from "react";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MessageForm } from "./message-form";
import { MessageCard } from "./messge-card";

interface MessageContainerProps {
  projectId: string;
}

export const MessageContainer = ({ projectId }: MessageContainerProps) => {
  const trpc = useTRPC();
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useSuspenseQuery(
    trpc.messages.getMany.queryOptions({
      projectId: projectId,
    })
  );

  useEffect(() => {
    const lastAssitantMessage = messages.findLast(
      (message) => message.role === "ASSISTANT"
    );

    if (lastAssitantMessage) {
      /* TODO */
    }
  }, [messages]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

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
            messages.map((message) => (
              <MessageCard
                key={message.id}
                content={message.content}
                role={message.role}
                fragment={message.fragments}
                createdAt={message.createdAt}
                isActiveFragment={false}
                onFragmentClick={() => {}}
                type={message.type}
              />
            ))
          )}
          <div ref={bottomRef} className="h-12" />
        </div>
      </div>

      <div className="absolute -top-6 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-background/70 pointer-events-none" />

      <MessageForm projectId={projectId} />
    </div>
  );
};

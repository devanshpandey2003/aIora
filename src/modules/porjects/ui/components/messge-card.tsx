import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { animate } from "animejs";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fragment, MessageRole, MessageType } from "@/generated/prisma";
import { ChevronRightIcon, Code2Icon } from "lucide-react";

interface UserMessageProps {
  content: string;
}

const UserMessage = ({ content }: UserMessageProps) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageRef.current && cardRef.current) {
      // Animate the entire message container
      animate(messageRef.current, {
        translateX: [50, 0],
        opacity: [0, 1],
        duration: 800,
        easing: "easeOutCubic",
      });

      // Animate the card with a delay
      animate(cardRef.current, {
        scale: [0.8, 1],
        rotateY: [10, 0],
        duration: 600,
        delay: 200,
        easing: "easeOutBack",
      });
    }
  }, []);

  const handleCardHover = () => {
    if (cardRef.current) {
      animate(cardRef.current, {
        scale: 1.02,
        translateY: -2,
        duration: 200,
        easing: "easeOutQuad",
      });
    }
  };

  const handleCardLeave = () => {
    if (cardRef.current) {
      animate(cardRef.current, {
        scale: 1,
        translateY: 0,
        duration: 200,
        easing: "easeOutQuad",
      });
    }
  };

  return (
    <div ref={messageRef} className="flex justify-end pb-6 pr-4 pl-12 group">
      <div className="flex items-start gap-3 max-w-[85%]">
        <Card
          ref={cardRef}
          className="rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white p-3 shadow-lg border-none break-words relative cursor-pointer transition-all duration-300 hover:shadow-xl"
          onMouseEnter={handleCardHover}
          onMouseLeave={handleCardLeave}
        >
          <div className="relative z-10 text-sm leading-relaxed">{content}</div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        </Card>
      </div>
    </div>
  );
};

interface FragmentCardProps {
  fragment: Fragment;
  isActive: boolean;
  onFragmentClick: (fragment: Fragment) => void;
}

const FragmentCard = ({
  fragment,
  isActive,
  onFragmentClick,
}: FragmentCardProps) => {
  return (
    <button
      className={cn(
        "mt-3 p-3 rounded-xl cursor-pointer transition-all duration-300 w-full text-left group border-2 hover:shadow-md",
        isActive
          ? "bg-blue-50 dark:bg-blue-900/50 border-blue-300 dark:border-blue-600 shadow-sm"
          : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      )}
      onClick={() => onFragmentClick(fragment)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Code2Icon className="size-5 mt-0.5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors truncate">
            {fragment.title}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
            Click to view code fragment
          </span>
        </div>
        <div className="flex items-center justify-center mt-3.5 ">
          <ChevronRightIcon className="size-4" />
        </div>
      </div>
    </button>
  );
};

interface AssistantMessageProps {
  content: string;
  fragment: Fragment | null;
  isActiveFragment: boolean;
  onFragmentClick: (fragment: Fragment) => void;
  type: MessageType;
  createdAt: Date;
}

const AssistantMessage = ({
  content,
  fragment,
  isActiveFragment,
  onFragmentClick,
  type,
  createdAt,
}: AssistantMessageProps) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageRef.current && cardRef.current) {
      // Animate the entire message container
      animate(messageRef.current, {
        translateX: [-50, 0],
        opacity: [0, 1],
        duration: 800,
        easing: "easeOutCubic",
      });

      // Animate the card
      animate(cardRef.current, {
        scale: [0.9, 1],
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 700,
        delay: 200,
        easing: "easeOutQuart",
      });
    }
  }, []);

  return (
    <div ref={messageRef} className="pb-6 pr-2 pl-2 group">
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
            {type === "ERROR" && (
              <Badge
                variant="destructive"
                className="text-xs px-2 py-1 font-medium"
              >
                Error
              </Badge>
            )}
            <span className="text-xs text-muted-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100 ml-auto">
              {format(createdAt, "HH:mm 'on' MMM dd, yyyy")}
            </span>
          </div>
          <Card
            ref={cardRef}
            className={cn(
              "rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-all duration-300",
              type === "ERROR" &&
                "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950"
            )}
          >
            <div
              className={cn(
                "prose prose-xs max-w-none text-gray-800 dark:text-gray-200 leading-relaxed text-sm",
                type === "ERROR" && "text-red-700 dark:text-red-400"
              )}
            >
              <div className="whitespace-pre-wrap text-sm">{content}</div>
              {fragment && type === "RESULT" && (
                <FragmentCard
                  fragment={fragment}
                  isActive={isActiveFragment}
                  onFragmentClick={onFragmentClick}
                />
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

interface MessageCardProps {
  content: string;
  role: MessageRole;
  fragment: Fragment | null;
  createdAt: Date;
  isActiveFragment: boolean;
  onFragmentClick: (fragment: Fragment) => void;
  type: MessageType;
}

export const MessageCard = ({
  content,
  role,
  fragment,
  createdAt,
  isActiveFragment,
  onFragmentClick,
  type,
}: MessageCardProps) => {
  if (role === "ASSISTANT") {
    return (
      <AssistantMessage
        content={content}
        fragment={fragment}
        isActiveFragment={isActiveFragment}
        onFragmentClick={onFragmentClick}
        type={type}
        createdAt={createdAt}
      />
    );
  }

  return <UserMessage content={content} />;
};

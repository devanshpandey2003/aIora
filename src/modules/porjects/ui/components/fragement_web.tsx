"use client";

import { useState } from "react";
import {
  ExternalLinkIcon,
  RefreshCwIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import { Fragment } from "@/generated/prisma";
import { Button } from "@/components/ui/button";

interface Props {
  data: Fragment;
}

export const FragmentWeb = ({ data }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState(data.sandboxUrl);

  const handleRefresh = () => {
    setIsLoading(true);
    // Force reload by changing the url state (add a dummy query param)
    setUrl((prev) => {
      const u = new URL(prev || data.sandboxUrl);
      u.searchParams.set("_r", Date.now().toString());
      return u.toString();
    });
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleExternalOpen = () => {
    window.open(data.sandboxUrl, "_blank");
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Browser Header */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        {/* Browser Controls */}
        <div className="flex items-center gap-1 px-3 py-2">
          {/* Navigation Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              disabled
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              disabled
            >
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={handleRefresh}
            >
              <RefreshCwIcon
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          {/* Address Bar */}
          <div className="flex-1 mx-3">
            <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 min-h-[32px]">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
              <div className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                {url || data.sandboxUrl}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={handleExternalOpen}
              title="Open in new tab"
            >
              <ExternalLinkIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <MoreHorizontalIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Browser Content */}
      <div className="flex-1 relative bg-white dark:bg-gray-900">
        {isLoading && (
          <div className="absolute inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <RefreshCwIcon className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          </div>
        )}
        <iframe
          id="fragment-iframe"
          className="w-full h-full border-0"
          src={url}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          loading="lazy"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
};

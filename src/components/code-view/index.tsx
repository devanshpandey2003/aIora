"use client";

import React, { useEffect, useRef, useState } from "react";
import Prism from "prismjs";
import {
  CopyIcon,
  DownloadIcon,
  MaximizeIcon,
  FileIcon,
  FileTextIcon,
  CodeIcon,
  ImageIcon,
  SettingsIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import "./code-theme.css";

// Import Prism languages
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-bash";

interface CodeFile {
  name: string;
  content: string;
  language: string;
}

interface Props {
  files: CodeFile[];
  activeFile?: string;
  onFileChange?: (fileName: string) => void;
  onFileRemove?: (fileName: string) => void;
  className?: string;
  theme?: "dark" | "light";
  showLineNumbers?: boolean;
  maxHeight?: string;
}

export const CodeView = ({
  files,
  activeFile,
  onFileChange,
  onFileRemove,
  className = "",
  theme = "dark",
  showLineNumbers = true,
}: Props) => {
  const [currentFile, setCurrentFile] = useState(
    activeFile || files[0]?.name || ""
  );
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const codeRef = useRef<HTMLElement>(null);

  const getFileExtension = (fileName: string): string => {
    return fileName.split(".").pop()?.toLowerCase() || "";
  };

  const getLanguageFromExtension = (fileName: string): string => {
    const ext = getFileExtension(fileName);
    const languageMap: Record<string, string> = {
      ts: "typescript",
      tsx: "tsx",
      js: "javascript",
      jsx: "jsx",
      css: "css",
      html: "markup",
      json: "json",
      sh: "bash",
      bash: "bash",
      md: "markdown",
      yml: "yaml",
      yaml: "yaml",
    };
    return languageMap[ext] || "javascript";
  };

  const currentFileData = files.find((file) => file.name === currentFile);

  const prismLanguage = currentFileData
    ? getLanguageFromExtension(currentFileData.name)
    : "javascript";

  useEffect(() => {
    if (activeFile && activeFile !== currentFile) {
      setCurrentFile(activeFile);
    }
  }, [activeFile, currentFile]);

  useEffect(() => {
    if (codeRef.current && currentFileData) {
      // Debug logging
      console.log("CodeView - Current file data:", currentFileData);
      console.log(
        "CodeView - File content length:",
        currentFileData.content?.length
      );
      console.log(
        "CodeView - File content preview:",
        currentFileData.content?.substring(0, 100)
      );
      console.log("CodeView - Language:", prismLanguage);

      Prism.highlightElement(codeRef.current);
    }
  }, [currentFileData, prismLanguage]);

  const handleFileChange = (fileName: string) => {
    setCurrentFile(fileName);
    onFileChange?.(fileName);
  };

  const handleFileRemove = (fileName: string, event: React.MouseEvent) => {
    event.stopPropagation();

    // If we're removing the current file, switch to another file
    if (fileName === currentFile) {
      const remainingFiles = files.filter((f) => f.name !== fileName);
      if (remainingFiles.length > 0) {
        const currentIndex = files.findIndex((f) => f.name === fileName);
        const nextFile = remainingFiles[Math.max(0, currentIndex - 1)];
        setCurrentFile(nextFile.name);
        onFileChange?.(nextFile.name);
      } else {
        setCurrentFile("");
      }
    }

    onFileRemove?.(fileName);
  };

  const copyToClipboard = async (content: string, fileName: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFile(fileName);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const downloadFile = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFileIcon = (fileName: string): React.ReactElement => {
    const ext = getFileExtension(fileName);

    switch (ext) {
      case "tsx":
        return <CodeIcon className="w-4 h-4 text-blue-400" />;
      case "ts":
        return <CodeIcon className="w-4 h-4 text-blue-600" />;
      case "jsx":
        return <CodeIcon className="w-4 h-4 text-yellow-400" />;
      case "js":
        return <CodeIcon className="w-4 h-4 text-yellow-500" />;
      case "css":
        return <FileTextIcon className="w-4 h-4 text-blue-500" />;
      case "scss":
      case "sass":
        return <FileTextIcon className="w-4 h-4 text-pink-500" />;
      case "html":
        return <FileTextIcon className="w-4 h-4 text-orange-500" />;
      case "json":
        return <SettingsIcon className="w-4 h-4 text-green-500" />;
      case "md":
        return <FileTextIcon className="w-4 h-4 text-gray-600" />;
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "svg":
        return <ImageIcon className="w-4 h-4 text-purple-500" />;
      case "yml":
      case "yaml":
        return <SettingsIcon className="w-4 h-4 text-gray-500" />;
      case "txt":
        return <FileTextIcon className="w-4 h-4 text-gray-500" />;
      default:
        return <FileIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  if (files.length === 0) {
    return (
      <div
        className={`code-view ${theme} ${className} flex items-center justify-center h-full`}
      >
        <div className="text-center">
          <FileIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">
            No code files available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`code-view ${theme} ${className} h-full flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg`}
    >
      {/* File Tabs */}
      {files.length > 0 && (
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {files.map((file) => (
            <div
              key={file.name}
              className={`flex items-center gap-2 px-3 py-2 border-r border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-0 ${
                currentFile === file.name
                  ? "bg-white dark:bg-gray-900 border-b-2 border-blue-500"
                  : ""
              }`}
              onClick={() => handleFileChange(file.name)}
            >
              {getFileIcon(file.name)}
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-32">
                {file.name.includes("/")
                  ? file.name.split("/").pop()
                  : file.name}
              </span>
              {files.length > 1 && (
                <button
                  className="ml-1 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  onClick={(e) => handleFileRemove(file.name, e)}
                  title="Close file"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Code content */}
      {currentFileData && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* File header with actions */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-2">
              {getFileIcon(currentFileData.name)}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {currentFileData.name.includes("/")
                    ? currentFileData.name.split("/").pop()
                    : currentFileData.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {currentFileData.name.includes("/")
                    ? currentFileData.name.substring(
                        0,
                        currentFileData.name.lastIndexOf("/")
                      )
                    : "src"}
                </span>
              </div>
              <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">
                {prismLanguage.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() =>
                  copyToClipboard(currentFileData.content, currentFileData.name)
                }
                title="Copy to clipboard"
              >
                <CopyIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() =>
                  downloadFile(currentFileData.content, currentFileData.name)
                }
                title="Download file"
              >
                <DownloadIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Maximize"
              >
                <MaximizeIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Copy notification */}
          {copiedFile === currentFileData.name && (
            <div className="absolute top-16 right-4 bg-green-600 text-white px-3 py-2 rounded-md text-sm z-20 shadow-lg">
              ✓ Copied to clipboard!
            </div>
          )}

          {/* Code block with Prism highlighting */}
          <div className="flex-1 min-h-0 relative">
            <div className="scrollable-code-container">
              <pre
                className={`language-${prismLanguage} m-0 ${
                  showLineNumbers ? "line-numbers" : ""
                }`}
              >
                <code
                  ref={codeRef}
                  className={`language-${prismLanguage} block`}
                >
                  {currentFileData.content}
                </code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export default and named export
export default CodeView;

// Re-export the component for convenience
export { CodeView as PrismCodeView };

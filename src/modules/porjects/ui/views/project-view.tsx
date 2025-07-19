"use client";

import { useTRPC } from "@/trpc/client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { MessageContainer } from "../components/message-container";

import { Fragment } from "@/generated/prisma";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Suspense, useState } from "react";
import { ProjectHeader } from "../components/project-header";
import { FragmentWeb } from "../components/fragement_web";

interface Props {
  projectId: string;
}

export const ProjectView = ({ projectId }: Props) => {
  const trpc = useTRPC();

  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);

  const { data: project } = useSuspenseQuery(
    trpc.projects.getOne.queryOptions({
      id: projectId,
    })
  );

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className="flex flex-col min-h-0"
        >
          <div className="flex-shrink-0">
            <ProjectHeader
              projectName={project.name}
              projectId={projectId}
              lastModified={project.updatedAt}
              onShare={() => {
                // TODO: Implement share functionality
                console.log("Share project:", projectId);
              }}
              onDownload={() => {
                // TODO: Implement download functionality
                console.log("Download project:", projectId);
              }}
              onDelete={() => {
                // TODO: Implement delete functionality
                console.log("Delete project:", projectId);
              }}
              onToggleVisibility={() => {
                // TODO: Implement visibility toggle
                console.log("Toggle visibility for project:", projectId);
              }}
            />
          </div>

          <div className="flex-1 min-h-0">
            <Suspense fallback={<p>Loading messages...</p>}>
              <MessageContainer
                activeFragment={activeFragment}
                setActiveFragment={setActiveFragment}
                projectId={projectId}
              />
            </Suspense>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={65} minSize={50}>
          {!!activeFragment && <FragmentWeb data={activeFragment} />}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

"use client";

import Image from "next/image";
import { ProjectFrom } from "@/modules/home/ui/components/project-form";
import { ProjectList } from "@/modules/home/ui/components/projects-list";

const Page = () => {
  return (
    <div className="flex flex-col max-w-7xl mx-auto w-full px-4">
      <section className="space-y-12 py-4 md:py-8 lg:py-10">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-chart-2/30 to-chart-3/30 rounded-full blur-2xl scale-150"></div>
            <Image
              src="/logo.svg"
              alt="Vibe"
              width={64}
              height={64}
              className="relative z-10 filter drop-shadow-2xl hover:scale-110 transition-all duration-500 ease-out"
            />
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight mb-6">
            Build Something Amazing with Vibe
          </h1>
          <p className="text-lg md:text-lg lg:text-lg text-muted-foreground/80 max-w-3xl leading-relaxed">
            Create, collaborate, and share your projects effortlessly with
            AI-driven development tools.
          </p>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-chart-2/5 rounded-3xl blur-3xl"></div>
          <ProjectFrom />
        </div>
        <div className="mt-24">
          <ProjectList />
        </div>
      </section>
    </div>
  );
};

export default Page;

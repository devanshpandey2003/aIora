"use client";

import Image from "next/image";
import { PricingTable } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

import { useCustomTheme } from "@/hooks/use-theme";

const Page = () => {
  const currentTheme = useCustomTheme();

  return (
    <div className="flex flex-col max-w-4xl mx-auto w-full px-4">
      <section className="space-y-4 pt-[8vh] 2xl:pt-12">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-2">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-chart-2/30 to-chart-3/30 rounded-full blur-2xl scale-150"></div>
            <Image
              src="/logo.svg"
              alt="Alora"
              width={64}
              height={64}
              className="relative z-10 filter drop-shadow-2xl hover:scale-110 transition-all duration-500 ease-out"
            />
          </div>
          <h1 className="text-2xl md:text-5xl lg:text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight mb-5">
            Pricing
          </h1>
          <p className="text-lg md:text-lg lg:text-lg text-muted-foreground/80 max-w-3xl leading-relaxed">
            Select the perfect plan for your development needs.
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-chart-2/5 rounded-3xl blur-3xl"></div>
          <PricingTable
            appearance={{
              baseTheme: currentTheme === "dark" ? dark : undefined,
              variables: {
                colorPrimary: "#C96342",
              },
              elements: {
                pricingTableCard:
                  "border! shadow-none! rounded-lg! bg-card/80 backdrop-blur-sm",
              },
            }}
          />
        </div>
      </section>
    </div>
  );
};

export default Page;

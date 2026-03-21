"use client";

import React from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowRight, Play, Users, Video, GraduationCap } from "lucide-react";
import dynamic from "next/dynamic";
import { RotatingText } from "@/components/ui/rotating-text";
import { TextShimmer } from "@/components/ui/text-shimmer";

const ShaderAnimation = dynamic(
  () => import("@/components/ui/shader-animation").then((m) => ({ default: m.ShaderAnimation })),
  { ssr: false }
);
const GlowyWaves = dynamic(
  () => import("@/components/ui/glowy-waves").then((m) => ({ default: m.GlowyWaves })),
  { ssr: false }
);

const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const stats = [
  { icon: Users, value: "3.4K", labelKey: "hero.stat_subscribers" },
  { icon: Video, value: "80", labelKey: "hero.stat_videos" },
  { icon: GraduationCap, value: "NUS", labelKey: "hero.stat_university" },
];

export function HeroSection() {
  const { t } = useI18n();

  return (
    <section className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden">
      {/* Background layers */}
      <ShaderAnimation />
      <GlowyWaves />

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-24 text-center md:px-8 lg:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          {/* Tagline */}
          <motion.div variants={itemVariants} className="mb-2 flex items-center justify-center gap-3 text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            <span>{t("hero.tagline_pre")}</span>
            <Popover>
              <PopoverTrigger asChild>
                <span className="relative cursor-pointer bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent hover:from-indigo-300 hover:via-violet-300 hover:to-cyan-300 transition-all duration-300">
                  {t("hero.highlight")}
                  <span className="absolute -inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </span>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 rounded-xl border border-border/60 bg-card/95 p-5 backdrop-blur-xl shadow-2xl"
                sideOffset={10}
              >
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">{t("hero.popover_title")}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t("hero.popover_desc")}</p>
                  <a
                    href="/projects"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    {t("hero.popover_link")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </PopoverContent>
            </Popover>
          </motion.div>

          {/* Rotating Text */}
          <motion.div variants={itemVariants} className="h-16 w-full flex items-center justify-center">
            <RotatingText
              texts={["AI", "Agents", "Tools", "Content", "Models"]}
              className="text-6xl font-bold sm:text-7xl lg:text-8xl"
              interval={2500}
            />
          </motion.div>

          {/* Subtitle with shimmer */}
          <motion.div variants={itemVariants} className="mt-2">
            <TextShimmer
              as="p"
              className="mx-auto max-w-2xl text-lg font-medium sm:text-xl"
            >
              {t("hero.subtitle")}
            </TextShimmer>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="group gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-8 text-base font-medium text-white transition-all hover:from-indigo-400 hover:to-violet-400 hover:shadow-lg hover:shadow-indigo-500/25"
            >
              <Play className="h-4 w-4" />
              {t("hero.cta_primary")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-border/40 bg-background/60 px-8 text-base font-medium text-foreground backdrop-blur transition-all hover:border-primary/50 hover:bg-primary/10"
              asChild
            >
              <a href="/contact">{t("hero.cta_secondary")}</a>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="mt-14 grid gap-6 rounded-2xl border border-border/30 bg-card/60 p-6 backdrop-blur-sm sm:grid-cols-3"
          >
            {stats.map((stat) => (
              <motion.div key={stat.labelKey} variants={itemVariants} className="flex flex-col items-center gap-1.5">
                <stat.icon className="h-5 w-5 text-primary/70" />
                <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{t(stat.labelKey)}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowRight, Play, Mail } from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";
import { NumberTicker } from "@/components/ui/number-ticker";
import { RotatingText } from "@/components/ui/rotating-text";

const stats = [
  { value: 3400, labelKey: "hero.stat_subscribers", suffix: "+" },
  { value: 80, labelKey: "hero.stat_videos", suffix: "" },
  { value: 0, labelKey: "hero.stat_university", display: "NUS", isText: true },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] as const },
  },
};

export function HeroSection() {
  const { t } = useI18n();

  return (
    <section className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 h-[600px] w-[600px] rounded-full bg-indigo-500/[0.1] blur-[140px]" />
      <div className="absolute bottom-1/4 -right-32 h-[500px] w-[500px] rounded-full bg-violet-500/[0.1] blur-[140px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-cyan-500/[0.06] blur-[120px]" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Hero border beam accent */}
      <BorderBeam
        size={300}
        duration={8}
        delay={2}
        colorFrom="#818cf8"
        colorTo="#06b6d4"
        className="opacity-40"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-32 text-center md:py-40">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full flex flex-col items-center"
        >
          {/* Greeting */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm">
              Hey Friends <span className="text-base">👋</span>
            </span>
          </motion.div>

          {/* Main title - Bigger and bolder */}
          <motion.div variants={itemVariants} className="mt-8">
            <h1 className="text-[clamp(3.5rem,12vw,9rem)] font-extrabold leading-[0.95] tracking-tight text-foreground">
              I BUILD
            </h1>
          </motion.div>

          {/* AI Popover title */}
          <motion.div variants={itemVariants}>
            <Popover>
              <PopoverTrigger asChild>
                <span className="relative cursor-pointer text-[clamp(3.5rem,12vw,9rem)] font-extrabold leading-[0.95] tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent hover:from-indigo-300 hover:via-violet-300 hover:to-cyan-300 transition-all duration-500">
                  AI
                </span>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 rounded-2xl border border-border/60 bg-card/95 p-6 backdrop-blur-2xl shadow-2xl"
                sideOffset={16}
              >
                <div className="space-y-3">
                  <h4 className="text-base font-semibold text-foreground">{t("hero.popover_title")}</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">{t("hero.popover_desc")}</p>
                  <a
                    href="/projects"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    {t("hero.popover_link")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </PopoverContent>
            </Popover>
          </motion.div>

          {/* Rotating tagline */}
          <motion.div variants={itemVariants} className="mt-6 h-8 flex items-center justify-center">
            <RotatingText
              texts={["AI Agents ·", "Foundation Models ·", "Productivity ·", "Content Creation ·"]}
              className="text-sm font-light tracking-wide text-muted-foreground/70"
              interval={3000}
            />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-xl text-lg text-muted-foreground"
          >
            {t("hero.subtitle")}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/videos"
              className="group inline-flex items-center gap-2.5 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-background transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-foreground/20"
            >
              <Play className="h-4 w-4 transition-transform group-hover:scale-110" />
              Watch Videos
            </a>
            <a
              href="/contact"
              className="group inline-flex items-center gap-2.5 rounded-full border border-white/[0.12] bg-white/[0.04] px-7 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.2]"
            >
              <Mail className="h-4 w-4 transition-transform group-hover:scale-110" />
              Get in Touch
            </a>
          </motion.div>

          {/* Stats glass card */}
          <motion.div
            variants={itemVariants}
            className="mt-16 inline-flex items-center gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-1.5 backdrop-blur-xl"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.labelKey}
                variants={itemVariants}
                className="flex items-center gap-2.5 rounded-xl bg-background/40 px-5 py-3 transition-colors hover:bg-white/[0.06]"
              >
                <span className="text-lg font-bold tabular-nums text-foreground">
                  {stat.isText ? (
                    stat.display
                  ) : (
                    <NumberTicker
                      value={stat.value}
                      direction="up"
                      delay={i * 0.3}
                      decimalPlaces={0}
                      className="text-lg font-bold tabular-nums text-foreground"
                    />
                  )}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {t(stat.labelKey)}
                  {stat.suffix && <span className="text-primary">{stat.suffix}</span>}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

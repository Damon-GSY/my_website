"use client";

import React from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { ArrowRight } from "lucide-react";

export function AboutBriefSection() {
  const { t } = useI18n();

  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-12 md:flex-row md:items-start"
        >
          {/* Photo placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex-shrink-0"
          >
            <div className="h-56 w-56 rounded-2xl border border-border/40 bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-cyan-500/10 p-[1px]">
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-card/80 text-muted-foreground">
                <span className="text-4xl">🧑‍💻</span>
              </div>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center md:text-left"
          >
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              {t("about_brief.title")}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {t("about_brief.description")}
            </p>
            <a
              href="/about"
              className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {t("about_brief.read_more")}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

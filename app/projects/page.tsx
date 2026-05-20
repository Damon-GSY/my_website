"use client";

import React from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { ExternalLink, Github } from "lucide-react";
import { projects } from "@/data/projects";

export default function ProjectsPage() {
  const { t } = useI18n();

  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">{t("projects.title")}</h1>
          <p className="mt-2 text-muted-foreground">Things I&apos;ve built and am working on</p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="group cursor-pointer rounded-2xl border border-border/40 bg-card/60 p-8 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${project.gradient} opacity-50 group-hover:opacity-70 transition-opacity`} />
              <div className="relative">
                <div className="mb-4 text-4xl">{project.emoji}</div>
                <h3 className="mb-2 text-2xl font-semibold text-foreground">{project.title}</h3>
                <p className="mb-4 text-muted-foreground leading-relaxed">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-secondary/80 px-3 py-1 text-xs font-mono text-muted-foreground">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

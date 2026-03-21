"use client";

import React from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { ArrowRight, ExternalLink } from "lucide-react";

const projects = [
  {
    title: "AI Research Agent",
    description: "Exploring how AI agents can assist with biomedical research and academic paper writing.",
    tags: ["React", "Python", "LLM", "Research"],
    span: "col-span-2",
    gradient: "from-indigo-500/20 to-violet-500/20",
    emoji: "🔬",
  },
  {
    title: "Productivity Suite",
    description: "A collection of AI-powered tools to boost your daily productivity.",
    tags: ["Notion", "AI", "Automation"],
    span: "col-span-1",
    gradient: "from-cyan-500/20 to-blue-500/20",
    emoji: "⚡",
  },
  {
    title: "Content Creator Kit",
    description: "Tools and templates for video editing, thumbnail design, and script writing.",
    tags: ["Video", "Design", "AI"],
    span: "col-span-1",
    gradient: "from-pink-500/20 to-rose-500/20",
    emoji: "🎬",
  },
  {
    title: "Tech Blog",
    description: "Sharing insights about AI tools, productivity methods, and tech trends.",
    tags: ["Next.js", "MDX", "AI"],
    span: "col-span-1",
    gradient: "from-amber-500/20 to-orange-500/20",
    emoji: "✍️",
  },
  {
    title: "Academic Helper",
    description: "AI-assisted literature review, data analysis, and academic writing support.",
    tags: ["Python", "NLP", "Data Science"],
    span: "col-span-2",
    gradient: "from-emerald-500/20 to-teal-500/20",
    emoji: "🎓",
  },
];

export function ProjectsSection() {
  const { t } = useI18n();

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-3xl font-bold text-foreground"
        >
          {t("projects.title")}
        </motion.h2>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`group cursor-pointer rounded-2xl border border-border/40 bg-card/60 p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 ${project.span}`}
            >
              {/* Gradient bg */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${project.gradient} opacity-50 group-hover:opacity-70 transition-opacity`} />

              <div className="relative">
                <div className="mb-4 text-3xl">{project.emoji}</div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">{project.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground leading-relaxed">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-secondary/80 px-3 py-1 text-xs font-mono text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

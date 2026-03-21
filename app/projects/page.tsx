"use client";

import React from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { ExternalLink, Github } from "lucide-react";

const projects = [
  {
    title: "AI Research Agent",
    description: "Exploring how AI agents can assist with biomedical research and academic paper writing. Leveraging LLMs for literature review, data extraction, and insight synthesis.",
    tags: ["React", "Python", "LLM", "Research"],
    gradient: "from-indigo-500/20 to-violet-500/20",
    emoji: "🔬",
  },
  {
    title: "Productivity Suite",
    description: "A collection of AI-powered tools to boost your daily productivity — from note-taking automation to workflow optimization.",
    tags: ["Notion", "AI", "Automation"],
    gradient: "from-cyan-500/20 to-blue-500/20",
    emoji: "⚡",
  },
  {
    title: "Content Creator Kit",
    description: "Tools and templates for video editing, thumbnail design, script writing, and content distribution across platforms.",
    tags: ["Video", "Design", "AI"],
    gradient: "from-pink-500/20 to-rose-500/20",
    emoji: "🎬",
  },
  {
    title: "Tech Blog",
    description: "In-depth articles about AI tools, productivity methods, and tech trends — helping readers stay ahead in the fast-moving AI landscape.",
    tags: ["Next.js", "MDX", "AI"],
    gradient: "from-amber-500/20 to-orange-500/20",
    emoji: "✍️",
  },
  {
    title: "Academic Helper",
    description: "AI-assisted literature review, data analysis, and academic writing support for researchers and students.",
    tags: ["Python", "NLP", "Data Science"],
    gradient: "from-emerald-500/20 to-teal-500/20",
    emoji: "🎓",
  },
];

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

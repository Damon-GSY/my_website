"use client";

import React from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Github, Youtube, Linkedin, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const timeline = [
  {
    year: "2024",
    title: "NUS Master's Student",
    description: "Started Master's program at National University of Singapore, focusing on AI and machine learning research.",
    tags: ["NUS", "AI", "Research"],
  },
  {
    year: "2023",
    title: "Started gdamon YouTube Channel",
    description: "Launched content creation journey — sharing AI tools, productivity tips, and tech insights with the world.",
    tags: ["YouTube", "Content", "AI Tools"],
  },
  {
    year: "2022",
    title: "Graduated from UNSW",
    description: "Completed undergraduate studies at the University of New South Wales with a strong foundation in computer science.",
    tags: ["UNSW", "Computer Science"],
  },
];

const skills = [
  "AI / ML", "React", "Next.js", "Python", "TypeScript",
  "Video Production", "UI/UX Design", "Data Analysis",
  "Academic Research", "Productivity", "Content Strategy",
];

export default function AboutPage() {
  const { t } = useI18n();

  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">About</h1>
          <p className="mt-2 text-muted-foreground">Getting to know the person behind the code</p>
        </motion.div>

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-16 flex flex-col items-center gap-12 md:flex-row md:items-start"
        >
          <div className="relative">
            <div className="h-64 w-64 rounded-2xl border border-border/40 bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-cyan-500/10 p-[1px]">
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-card/80 text-6xl">
                🧑‍💻
              </div>
            </div>
          </div>
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-2xl font-bold text-foreground">Hey, I&apos;m Damon.</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              I&apos;m a Master&apos;s student at NUS, passionate about AI and how it transforms the way we work, learn, and create.
              Through my channel gdamon, I share practical insights on AI tools, productivity methods, and academic research
              — helping others harness technology to work smarter, not harder.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              I believe the future belongs to those who can effectively collaborate with AI.
              That&apos;s what I&apos;m building toward — and what I love sharing with my audience.
            </p>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-24"
        >
          <h2 className="mb-12 text-3xl font-bold text-foreground">My Journey</h2>
          <div className="relative border-l-2 border-primary/30 pl-8 space-y-16">
            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative"
              >
                <div className="absolute -left-[41px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-background">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">{item.year}</span>
                <h3 className="mt-1 text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-24"
        >
          <h2 className="mb-8 text-3xl font-bold text-foreground">Skills & Interests</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="outline" className="rounded-full px-4 py-1.5 text-sm font-normal transition-colors hover:bg-primary/10 hover:text-primary hover:border-primary/30">
                {skill}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-24 flex flex-col items-center gap-4"
        >
          <h2 className="text-3xl font-bold text-foreground">Connect</h2>
          <div className="flex gap-4">
            <a href="https://github.com/Damon-GSY" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2 rounded-full"><Github className="h-4 w-4" /> GitHub</Button>
            </a>
            <a href="https://www.youtube.com/@gd.amon" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2 rounded-full"><Youtube className="h-4 w-4" /> YouTube</Button>
            </a>
            <a href="https://www.linkedin.com/in/shengyue-guan-1a7b3226b/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2 rounded-full"><Linkedin className="h-4 w-4" /> LinkedIn</Button>
            </a>
            <a href="https://space.bilibili.com/358541297" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2 rounded-full"><ExternalLink className="h-4 w-4" /> Bilibili</Button>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

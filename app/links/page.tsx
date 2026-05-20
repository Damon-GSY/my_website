"use client";

import React from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { links } from "@/data/links";

export default function LinksPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto flex max-w-md flex-col items-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary/30 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 text-4xl">
            🧑‍💻
          </div>
          <h1 className="text-3xl font-bold text-foreground">Damon Guan</h1>
          <p className="text-muted-foreground">I Build AI</p>
        </motion.div>

        <div className="mt-10 w-full space-y-3">
          {links.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              className={`flex items-center justify-between rounded-xl border border-border/40 bg-card/60 p-4 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-md ${link.color}`}
            >
              <div className="flex items-center gap-3">
                <link.icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <span className="block text-sm font-medium text-foreground">{link.label}</span>
                  <span className="block text-xs text-muted-foreground">{link.sublabel}</span>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}

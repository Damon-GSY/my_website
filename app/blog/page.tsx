"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function BlogPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">Blog</h1>
          <p className="mt-2 text-muted-foreground">Thoughts, tutorials, and deep dives</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-20"
        >
          <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-semibold text-foreground">Coming Soon</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Long-form articles about AI, productivity, and tech are on the way.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

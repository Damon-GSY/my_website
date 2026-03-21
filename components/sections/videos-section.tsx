"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Play } from "lucide-react";
import { videos } from "@/data/videos";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const categories = [
  { key: "all", labelKey: "videos.all" },
  { key: "ai_tools", labelKey: "videos.ai_tools" },
  { key: "productivity", labelKey: "videos.productivity" },
  { key: "academic", labelKey: "videos.academic" },
  { key: "tech", labelKey: "videos.tech" },
];

export function VideosSection() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const filtered = activeTab === "all" ? videos : videos.filter((v) => v.category === activeTab);
  const display = filtered.slice(0, 3);

  const selected = videos.find((v) => v.id === selectedVideo);

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex items-center justify-between"
        >
          <h2 className="text-3xl font-bold text-foreground">{t("videos.title")}</h2>
          <a
            href="/videos"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("videos.view_all")}
          </a>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 flex flex-wrap gap-2"
        >
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveTab(cat.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                activeTab === cat.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {t(cat.labelKey)}
            </button>
          ))}
        </motion.div>

        {/* Video Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {display.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedVideo(video.id)}
              className="group cursor-pointer overflow-hidden rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-secondary/50">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-violet-500/10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary group-hover:bg-primary/30 transition-colors">
                    <Play className="h-5 w-5 ml-0.5" />
                  </div>
                </div>
              </div>
              {/* Info */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-foreground line-clamp-2">
                  {video.title}
                </h3>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{video.views} views</span>
                  <span>•</span>
                  <span>{video.time || "LIVE"}</span>
                  <span>•</span>
                  <span>{video.ago}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Video Dialog */}
        <Dialog open={!!selected} onOpenChange={(open) => !open && setSelectedVideo(null)}>
          <DialogContent className="max-w-4xl p-0">
            <DialogTitle className="sr-only">{selected?.title}</DialogTitle>
            <DialogDescription className="sr-only">YouTube video player</DialogDescription>
            {selected && (
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${selected.youtubeId}`}
                  title={selected.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full rounded-lg"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

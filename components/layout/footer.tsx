"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Github, Youtube, Linkedin, Mail, Rss } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-lg font-bold tracking-[0.3em] text-foreground">
              DAMON
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              I Build AI
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              {t("footer.explore")}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {t("nav.projects")}
                </Link>
              </li>
              <li>
                <Link href="/links" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {t("nav.links")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Content */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              {t("footer.content")}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/videos" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {t("nav.videos")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {t("nav.blog")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              {t("footer.social")}
            </h4>
            <div className="flex gap-3">
              <a
                href="https://github.com/Damon-GSY"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://www.youtube.com/@gd.amon"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/shengyue-guan-1a7b3226b/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="mailto:contact@damonguan.com"
                className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-border/40" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}

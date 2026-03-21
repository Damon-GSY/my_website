"use client";

import React from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewsletterSection() {
  const { t } = useI18n();

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-md px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            {t("newsletter.title")}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("newsletter.description")}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Input
              type="email"
              placeholder={t("newsletter.placeholder")}
              className="h-12 rounded-full border-border/40 bg-secondary/50 text-foreground placeholder:text-muted-foreground/50"
            />
            <Button className="h-12 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 font-medium text-white hover:from-indigo-400 hover:to-violet-400">
              {t("newsletter.subscribe")}
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            {t("newsletter.trust")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

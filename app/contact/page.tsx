"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Github, Linkedin, Youtube, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const socialLinks = [
  { icon: Mail, label: "contact@damonguan.com", href: "mailto:contact@damonguan.com" },
  { icon: Github, label: "Damon-GSY", href: "https://github.com/Damon-GSY" },
  { icon: Youtube, label: "gdamon", href: "https://www.youtube.com/@gd.amon" },
  { icon: Linkedin, label: "Shengyue Guan", href: "https://www.linkedin.com/in/shengyue-guan-1a7b3226b/" },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">Get in Touch</h1>
          <p className="mt-2 text-muted-foreground">Have an idea or want to collaborate? Let&apos;s talk.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-12 grid gap-12 md:grid-cols-5"
        >
          {/* Info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">Let&apos;s Talk</h3>
              <p className="text-sm text-muted-foreground">
                Want to collaborate on an AI project? Have an idea for a video? Or just want to say hi?
                I&apos;m always open to interesting conversations.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-foreground">Ways to reach me</h4>
              <div className="space-y-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <link.icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-3">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex h-full min-h-[300px] items-center justify-center rounded-2xl border border-border/40 bg-card/60 p-8 text-center"
              >
                <div className="text-4xl mb-3">✉️</div>
                <p className="text-lg font-medium text-foreground">Message Sent!</p>
                <p className="text-sm text-muted-foreground">I&apos;ll get back to you soon.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input placeholder="Name" className="h-11 rounded-xl border-border/40 bg-secondary/50" />
                <Input type="email" placeholder="Email" className="h-11 rounded-xl border-border/40 bg-secondary/50" />
                <Textarea placeholder="Your message..." rows={5} className="min-h-[120px] rounded-xl border-border/40 bg-secondary/50 resize-none" />
                <Button type="submit" size="lg" className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 font-medium text-white hover:from-indigo-400 hover:to-violet-400">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

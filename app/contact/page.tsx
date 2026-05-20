"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Github, Linkedin, Youtube, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const socialLinks = [
  { icon: Mail, label: "contact@damonguan.com", href: "mailto:contact@damonguan.com" },
  { icon: Github, label: "Damon-GSY", href: "https://github.com/Damon-GSY" },
  { icon: Youtube, label: "gdamon", href: "https://www.youtube.com/@gd.amon" },
  { icon: Linkedin, label: "Shengyue Guan", href: "https://www.linkedin.com/in/shengyue-guan-1a7b3226b/" },
];

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
  _root?: string;
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim(),
    };

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        try {
          const result = await res.json();
          const fieldErrors: FormErrors = {};
          for (const err of result.errors ?? []) {
            if (err.field === "name" || err.field === "email" || err.field === "message" || err.field === "_root") {
              fieldErrors[err.field as keyof FormErrors] = err.message;
            }
          }
          setErrors(fieldErrors);
        } catch {
          setErrors({ _root: "Something went wrong. Please try again later." });
        }
        return;
      }

      setSubmitted(true);
    } catch {
      setErrors({ _root: "Something went wrong. Please try again later." });
    } finally {
      setLoading(false);
    }
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
                className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border border-border/40 bg-card/60 p-8 text-center"
              >
                <div className="text-4xl mb-3">&#9993;&#65039;</div>
                <p className="text-lg font-medium text-foreground">Message Sent!</p>
                <p className="text-sm text-muted-foreground">I&apos;ll get back to you soon.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors._root && (
                  <p className="text-sm text-destructive rounded-xl bg-destructive/10 px-4 py-2">{errors._root}</p>
                )}
                <div>
                  <Input name="name" placeholder="Name" disabled={loading} className="h-11 rounded-xl border-border/40 bg-secondary/50" />
                  {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                </div>
                <div>
                  <Input name="email" type="email" placeholder="Email" disabled={loading} className="h-11 rounded-xl border-border/40 bg-secondary/50" />
                  {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
                </div>
                <div>
                  <Textarea name="message" placeholder="Your message..." rows={5} disabled={loading} className="min-h-[120px] rounded-xl border-border/40 bg-secondary/50 resize-none" />
                  {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
                </div>
                <Button type="submit" size="lg" disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 font-medium text-white hover:from-indigo-400 hover:to-violet-400">
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

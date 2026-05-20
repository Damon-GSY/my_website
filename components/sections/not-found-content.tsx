"use client";

import React, { Component } from "react";
import { ArrowLeft } from "lucide-react";
import VaporizeTextCycle, { Tag } from "@/components/ui/vapour-text-effect";

type ErrorBoundaryProps = { children: React.ReactNode; fallback: React.ReactNode };
type ErrorBoundaryState = { hasError: boolean };

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export function NotFoundContent() {
  return (
    <section className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-1/3 -left-32 h-[500px] w-[500px] rounded-full bg-indigo-500/[0.08] blur-[140px]" />
      <div className="absolute bottom-1/3 -right-32 h-[400px] w-[400px] rounded-full bg-violet-500/[0.08] blur-[140px]" />

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-6 text-center">
        {/* 404 with VapourTextEffect */}
        <div className="h-[200px] w-full sm:h-[280px]">
          <ErrorBoundary
            fallback={
              <h1 className="text-[clamp(6rem,20vw,14rem)] font-extrabold leading-none tracking-tighter bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                404
              </h1>
            }
          >
            <VaporizeTextCycle
              texts={["404"]}
              font={{
                fontFamily: "var(--font-inter)",
                fontSize: "140px",
                fontWeight: 800,
              }}
              color="rgb(129, 140, 248)"
              spread={3}
              density={5}
              animation={{
                vaporizeDuration: 3,
                fadeInDuration: 1.5,
                waitDuration: 2,
              }}
              direction="left-to-right"
              alignment="center"
              tag={Tag.H1}
            />
          </ErrorBoundary>
        </div>

        <h2 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
          Page Not Found
        </h2>

        <p className="mt-4 max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <a
          href="/"
          className="group mt-10 inline-flex items-center gap-2.5 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-background transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-foreground/20"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Home
        </a>
      </div>
    </section>
  );
}

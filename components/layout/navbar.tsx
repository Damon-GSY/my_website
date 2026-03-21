"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  Menu,
  Languages,
} from "lucide-react";

function NavLinks({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const { t } = useI18n();

  const links = [
    { href: "/about", label: t("nav.about") },
    { href: "/videos", label: t("nav.videos") },
    { href: "/projects", label: t("nav.projects") },
    { href: "/blog", label: t("nav.blog") },
    { href: "/links", label: t("nav.links") },
  ];

  const handleClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={handleClick}
          className={`text-sm font-medium text-muted-foreground transition-colors hover:text-foreground ${
            mobile ? "block py-3 text-lg" : ""
          }`}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}

function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "zh" : "en")}
      className="flex items-center gap-1.5 rounded-full border border-border/40 bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur transition-all hover:border-border/60 hover:text-foreground"
    >
      <Languages className="h-3.5 w-3.5" />
      {locale === "en" ? "中" : "EN"}
    </button>
  );
}

export function Navbar() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/40 bg-background/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold tracking-[0.3em] text-foreground">
          DAMON
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <NavLinks />
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          <Link href="/contact" className="hidden md:block">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-border/40 bg-background/60 text-sm text-foreground backdrop-blur transition-all hover:border-primary/50 hover:bg-primary/10"
            >
              {t("nav.contact")}
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <button className="rounded-md p-2 text-muted-foreground hover:text-foreground">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background border-border">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex flex-col gap-2 pt-8">
                <NavLinks mobile onClose={() => setOpen(false)} />
                <Link href="/contact" onClick={() => setOpen(false)} className="mt-4">
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-border/40 bg-background/60 text-foreground"
                  >
                    {t("nav.contact")}
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

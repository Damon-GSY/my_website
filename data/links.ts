import { Youtube, Linkedin, Github, Mail, Globe } from "lucide-react";

export const links = [
  {
    label: "YouTube",
    sublabel: "gdamon · 3.4K Subscribers",
    href: "https://www.youtube.com/@gd.amon",
    icon: Youtube,
    color: "hover:bg-red-500/10 hover:text-red-400",
  },
  {
    label: "Bilibili",
    sublabel: "Content Creator",
    href: "https://space.bilibili.com/358541297",
    icon: Globe,
    color: "hover:bg-cyan-500/10 hover:text-cyan-400",
  },
  {
    label: "LinkedIn",
    sublabel: "Professional",
    href: "https://www.linkedin.com/in/shengyue-guan-1a7b3226b/",
    icon: Linkedin,
    color: "hover:bg-blue-500/10 hover:text-blue-400",
  },
  {
    label: "GitHub",
    sublabel: "Developer",
    href: "https://github.com/Damon-GSY",
    icon: Github,
    color: "hover:bg-gray-500/10 hover:text-gray-300",
  },
  {
    label: "Email",
    sublabel: "Get in Touch",
    href: "mailto:contact@damonguan.com",
    icon: Mail,
    color: "hover:bg-primary/10 hover:text-primary",
  },
];

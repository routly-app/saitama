import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Saitama | Crypto Payment Infrastructure and APIs for Developers",
  description:
    "A open-sourced crypto payment platform built for developers. Enable quick, easy, and cost-effective crypto payment that seamlessly integrates with your existing applications.",
  themeConfig: {
    siteTitle: "Saitama",

    logo: {
      dark: "/favicon.dark.ico",
      light: "/favicon.ico",
    },
    nav: [{ text: "Home", link: "/" }],
    sidebar: [],
    socialLinks: [
      { icon: "github", link: "https://github.com/saitamadotfun/saitama" },
    ],
  },
});

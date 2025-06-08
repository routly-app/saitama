import "@unocss/reset/tailwind.css";
import { Open_Sans } from "next/font/google";

import "./index.css";

const defaultFont = Open_Sans({
  subsets: ["latin"],
});

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html
      lang="en"
      className={defaultFont.className}
    >
      <body className="fixed inset-0 flex flex-col space-y-4 dark:bg-dark-900 dark:text-white font-sans">
        {children}
      </body>
    </html>
  );
}

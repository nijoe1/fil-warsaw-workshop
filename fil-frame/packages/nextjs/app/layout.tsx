"use client";

import { useEffect, useState } from "react";
import "@rainbow-me/rainbowkit/styles.css";
import { FILFrameAppWithProviders } from "~~/components/FILFrameAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";

const FILFrameApp = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html suppressHydrationWarning>
      <head>
        <title>FIL-Frame App</title>
        <meta name="description" content="Built with 🏗 FIL-Frame" />
        <meta name="keywords" content="Filecoin, FIL-Frame, synapse-sdk, pdp, upload, filecoin, usdfc" />
        <meta name="author" content="FIL-Builders" />
        <meta name="viewport" content="width=device-width, initial-scale=0.6" />
        <link rel="icon" href="/favicon.png" />
      </head>
      <body>
        {mounted && (
          <ThemeProvider enableSystem>
            <FILFrameAppWithProviders>{children}</FILFrameAppWithProviders>
          </ThemeProvider>
        )}
      </body>
    </html>
  );
};

export default FILFrameApp;

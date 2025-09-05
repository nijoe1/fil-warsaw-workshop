"use client";

import { AvatarComponent } from "@rainbow-me/rainbowkit";
import { blo } from "blo";
import dynamic from "next/dynamic";

// Custom Avatar for RainbowKit - wrapped in dynamic to prevent SSR
const BlockieAvatarInner: AvatarComponent = ({ address, ensImage, size }) => (
  // Don't want to use nextJS Image here (and adding remote patterns for the URL)
  // eslint-disable-next-line @next/next/no-img-element
  <img
    className="rounded-full"
    src={ensImage || blo(address as `0x${string}`)}
    width={size}
    height={size}
    alt={`${address} avatar`}
  />
);

export const BlockieAvatar = dynamic(() => Promise.resolve(BlockieAvatarInner), {
  ssr: false,
  loading: () => (
    <div
      className="rounded-full bg-gray-300 animate-pulse"
      style={{
        width: 24,
        height: 24,
      }}
    />
  ),
}) as AvatarComponent;

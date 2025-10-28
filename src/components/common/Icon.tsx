import React from "react";

export default function Icon({
  name,
  size = 18,
}: {
  name: string;
  size?: number;
}) {
  switch (name) {
    case "menu":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <path
            d="M3 6h18M3 12h18M3 18h18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "plus":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return <span />;
  }
}

import React from "react";

/**
 * GridBackground - Simple grid pattern background
 */
export default function GridBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--grid-line-color, rgba(128, 128, 128, 0.1)) 1px, transparent 1px),
            linear-gradient(to bottom, var(--grid-line-color, rgba(128, 128, 128, 0.1)) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, var(--background, hsl(var(--background))) 80%)",
        }}
      />
    </div>
  );
}

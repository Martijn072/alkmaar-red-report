import * as React from "react";
import { cn } from "@/lib/utils";

// Display - voor hero's en grote titels
export const Display = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h1 ref={ref} className={cn("font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight", className)} {...props} />
  )
);
Display.displayName = "Display";

// H1 - pagina titels
export const H1 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h1 ref={ref} className={cn("font-headline text-3xl md:text-4xl font-bold tracking-tight", className)} {...props} />
  )
);
H1.displayName = "H1";

// H2 - section titels
export const H2 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("font-headline text-2xl md:text-3xl font-semibold tracking-tight", className)} {...props} />
  )
);
H2.displayName = "H2";

// H3 - subsection titels
export const H3 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-headline text-xl md:text-2xl font-semibold", className)} {...props} />
  )
);
H3.displayName = "H3";

// H4 - card titels
export const H4 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h4 ref={ref} className={cn("font-headline text-lg md:text-xl font-semibold", className)} {...props} />
  )
);
H4.displayName = "H4";

// Lead - intro tekst
export const Lead = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-lg md:text-xl text-muted-foreground leading-relaxed", className)} {...props} />
  )
);
Lead.displayName = "Lead";

// Body - standaard tekst
export const Body = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-base leading-relaxed", className)} {...props} />
  )
);
Body.displayName = "Body";

// BodyLarge - iets grotere body tekst
export const BodyLarge = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-lg leading-relaxed", className)} {...props} />
  )
);
BodyLarge.displayName = "BodyLarge";

// Caption - kleine tekst, metadata
export const Caption = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
Caption.displayName = "Caption";

// Label - form labels, tags
export const TypographyLabel = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn("text-sm font-medium", className)} {...props} />
  )
);
TypographyLabel.displayName = "TypographyLabel";

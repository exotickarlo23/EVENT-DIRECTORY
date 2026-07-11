import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";

// ---------- Button ----------

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "gold";
type ButtonSize = "sm" | "md" | "lg";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none min-h-11";
const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-coral text-white hover:bg-coral-dark",
  secondary: "bg-plum text-white hover:bg-plum-soft",
  outline: "border-2 border-plum/15 bg-white text-plum hover:border-plum/40",
  ghost: "text-plum hover:bg-sand",
  gold: "bg-gold text-plum hover:brightness-95",
};
const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button
      className={cn(buttonBase, buttonVariants[variant], buttonSizes[size], className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <Link
      className={cn(buttonBase, buttonVariants[variant], buttonSizes[size], className)}
      {...props}
    />
  );
}

// ---------- Badge ----------

type BadgeVariant = "featured" | "unclaimed" | "demo" | "neutral" | "teal" | "success" | "warning" | "danger";
const badgeVariants: Record<BadgeVariant, string> = {
  featured: "bg-gold text-plum",
  unclaimed: "bg-sand text-muted",
  demo: "bg-teal/10 text-teal",
  neutral: "bg-sand text-plum",
  teal: "bg-teal text-white",
  success: "bg-teal/10 text-teal",
  warning: "bg-gold/25 text-plum",
  danger: "bg-coral/10 text-coral-dark",
};

export function Badge({
  variant = "neutral",
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold",
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ---------- Form controls ----------

const inputBase =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-coral focus:outline-none min-h-11";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputBase, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(inputBase, "min-h-28", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select className={cn(inputBase, "appearance-none pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export function Label({ className, children, ...props }: ComponentProps<"label">) {
  return (
    <label className={cn("mb-1.5 block text-sm font-semibold text-plum", className)} {...props}>
      {children}
    </label>
  );
}

export function FieldError({ error, id }: { error?: string; id?: string }) {
  if (!error) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-sm font-medium text-coral-dark">
      {error}
    </p>
  );
}

// ---------- Section heading ----------

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("mb-8 max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? (
        <p className="mb-2 text-sm font-bold uppercase tracking-wider text-coral">{eyebrow}</p>
      ) : null}
      <h2 className="font-display text-3xl font-semibold text-plum md:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-3 text-base text-muted md:text-lg">{subtitle}</p> : null}
    </div>
  );
}

// ---------- Skeleton ----------

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-sand", className)} aria-hidden="true" />;
}

export function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-white shadow-card">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

// ---------- Empty state ----------

export function EmptyState({
  title,
  text,
  children,
}: {
  title: string;
  text?: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-card border border-line bg-white p-10 text-center shadow-card">
      <h3 className="font-display text-2xl font-semibold text-plum">{title}</h3>
      {text ? <p className="mx-auto mt-2 max-w-md text-muted">{text}</p> : null}
      {children ? <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div> : null}
    </div>
  );
}

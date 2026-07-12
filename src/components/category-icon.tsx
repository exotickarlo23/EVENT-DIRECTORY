import {
  Castle,
  Smile,
  PartyPopper,
  Wand2,
  Camera,
  Music,
  Aperture,
  Sparkles,
  Utensils,
  Cake,
  Building2,
  Package,
  Tent,
  Lightbulb,
  ClipboardList,
  Gift,
  Flower2,
  Car,
  Star,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  castle: Castle,
  smile: Smile,
  "party-popper": PartyPopper,
  "wand-2": Wand2,
  camera: Camera,
  music: Music,
  aperture: Aperture,
  sparkles: Sparkles,
  utensils: Utensils,
  cake: Cake,
  "building-2": Building2,
  package: Package,
  tent: Tent,
  lightbulb: Lightbulb,
  "clipboard-list": ClipboardList,
  gift: Gift,
  "flower-2": Flower2,
  car: Car,
  book: BookOpen,
};

export function CategoryIcon({
  icon,
  className,
}: {
  icon: string | null | undefined;
  className?: string;
}) {
  const Icon = (icon && ICONS[icon]) || Star;
  return <Icon className={className} aria-hidden="true" />;
}

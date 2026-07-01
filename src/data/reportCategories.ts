import {
  AlertTriangle,
  Droplets,
  Lightbulb,
  MapPin,
  Recycle,
  ShieldAlert,
  Trash2,
  Waves
} from "lucide-react";

export const reportCategories = [
  {
    title: "Flooding",
    description: "Blocked drains, recurring flood points, and stormwater risks.",
    icon: Waves
  },
  {
    title: "Poor Drainage",
    description: "Open gutters, stagnant water, and damaged drainage channels.",
    icon: Droplets
  },
  {
    title: "Illegal Dumping",
    description: "Unapproved dumping sites, overflowing waste, and litter hotspots.",
    icon: Trash2
  },
  {
    title: "Streetlights",
    description: "Broken lights, dark routes, and unsafe nighttime corridors.",
    icon: Lightbulb
  },
  {
    title: "Unsafe Roads",
    description: "Potholes, missing signs, risky junctions, and pedestrian hazards.",
    icon: AlertTriangle
  },
  {
    title: "Sanitation",
    description: "Public health concerns, waste collection gaps, and dirty public spaces.",
    icon: Recycle
  },
  {
    title: "Community Safety",
    description: "Local safety concerns that need attention from responsible services.",
    icon: ShieldAlert
  },
  {
    title: "Public Infrastructure",
    description: "Damaged public facilities, broken amenities, and access issues.",
    icon: MapPin
  }
];

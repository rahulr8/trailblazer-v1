export interface Adventure {
  id: number;
  title: string;
  subtitle: string;
  img: string;
  desc: string;
  paid: boolean;
}

export interface Reward {
  id: number;
  title: string;
  desc: string;
  code: string;
  icon: string;
  color: string;
  bg?: string;
}

export interface LeaderboardUser {
  name: string;
  score: string;
  img: string;
  active?: boolean;
}

export interface Activity {
  id: number;
  name: string;
  icon: string;
  time: string;
  date: string;
  duration: string;
  bgColor: string;
  iconColor: string;
}

// BC Adventures data with real Unsplash images
export const adventures: Adventure[] = [
  {
    id: 1,
    title: "Garibaldi Lake",
    subtitle: "Whistler • Hard",
    img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    desc: "A turquoise alpine lake with stunning glacier views. One of BC's most iconic hiking destinations.",
    paid: false,
  },
  {
    id: 2,
    title: "Grouse Grind",
    subtitle: "N. Vancouver • Hard",
    img: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
    desc: "Mother Nature's Stairmaster. 2.9km steep ascent with 2,830 stairs.",
    paid: true,
  },
  {
    id: 3,
    title: "Stanley Park",
    subtitle: "Vancouver • Easy",
    img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    desc: "Forest trails right in the heart of the city. Perfect for a relaxed walk or bike ride.",
    paid: false,
  },
  {
    id: 4,
    title: "Joffre Lakes",
    subtitle: "Pemberton • Moderate",
    img: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80",
    desc: "Three stunning glacial lakes with vibrant turquoise waters. Famous for the log at the middle lake.",
    paid: false,
  },
  {
    id: 5,
    title: "Tofino Surf",
    subtitle: "Vancouver Island • Exp",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    desc: "Canada's best surfing beaches on the wild west coast. Perfect for beginners and experts alike.",
    paid: true,
  },
  {
    id: 6,
    title: "Sea to Sky Gondola",
    subtitle: "Squamish • Easy",
    img: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&q=80",
    desc: "Panoramic views of Howe Sound and surrounding mountains. Multiple trails at the summit.",
    paid: true,
  },
  {
    id: 7,
    title: "Capilano Bridge",
    subtitle: "N. Vancouver • Easy",
    img: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800&q=80",
    desc: "Iconic suspension bridge amidst towering evergreens. Includes cliff walk and treetops adventure.",
    paid: true,
  },
];

// Partner rewards data with real images
export const rewards: Reward[] = [
  {
    id: 1,
    title: "Arc'teryx",
    desc: "20% Off outerwear",
    code: "TRAIL20",
    icon: "shirt",
    color: "#ffffff",
    bg: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
  },
  {
    id: 2,
    title: "Patagonia",
    desc: "Free Repairs",
    code: "REPAIR",
    icon: "mountain",
    color: "#663399",
    bg: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  },
  {
    id: 3,
    title: "MEC",
    desc: "$20 Gift Card",
    code: "MEC20",
    icon: "tent",
    color: "#228B22",
    bg: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80",
  },
  {
    id: 4,
    title: "North Face",
    desc: "15% Off",
    code: "TNF15",
    icon: "snowflake",
    color: "#FF0000",
    bg: "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=800&q=80",
  },
  {
    id: 5,
    title: "Vessi",
    desc: "Free Socks",
    code: "DRYFEET",
    icon: "footprints",
    color: "#00BFFF",
    bg: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80",
  },
  {
    id: 6,
    title: "Running Room",
    desc: "Free Gait Analysis",
    code: "RUNFREE",
    icon: "activity",
    color: "#FFA500",
    bg: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80",
  },
  {
    id: 7,
    title: "Lululemon",
    desc: "Exclusive Access",
    code: "SWEAT",
    icon: "heart",
    color: "#C71585",
    bg: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
  },
  {
    id: 8,
    title: "Scandinave",
    desc: "15% Off Baths",
    code: "RELAX",
    icon: "droplets",
    color: "#40E0D0",
    bg: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
  },
  {
    id: 9,
    title: "Evo",
    desc: "Free Signup + 30m",
    code: "DRIVEEVO",
    icon: "car",
    color: "#1E90FF",
    bg: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80",
  },
  {
    id: 10,
    title: "HelloFresh",
    desc: "Free First Box",
    code: "FRESH",
    icon: "package",
    color: "#32CD32",
    bg: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  },
  {
    id: 11,
    title: "Spotify",
    desc: "1 Month Premium",
    code: "MUSIC",
    icon: "music",
    color: "#1DB954",
    bg: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&q=80",
  },
  {
    id: 12,
    title: "Audible",
    desc: "2 Free Audiobooks",
    code: "LISTEN",
    icon: "book-open",
    color: "#FFA07A",
    bg: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80",
  },
];

// Leaderboard data with avatar placeholders
export const leaderboardGlobal: LeaderboardUser[] = [
  { name: "Sarah J.", score: "124km", img: "https://i.pravatar.cc/100?img=1" },
  { name: "David C.", score: "118km", img: "https://i.pravatar.cc/100?img=3" },
  { name: "Maria R.", score: "92km", img: "https://i.pravatar.cc/100?img=5" },
  {
    name: "You",
    score: "58km",
    img: "https://i.pravatar.cc/100?img=8",
    active: true,
  },
  { name: "James W.", score: "45km", img: "https://i.pravatar.cc/100?img=11" },
];

export const leaderboardFriends: LeaderboardUser[] = [
  { name: "Alice M.", score: "76km", img: "https://i.pravatar.cc/100?img=9" },
  {
    name: "You",
    score: "58km",
    img: "https://i.pravatar.cc/100?img=8",
    active: true,
  },
  { name: "Bob S.", score: "42km", img: "https://i.pravatar.cc/100?img=12" },
  { name: "Charlie", score: "30km", img: "https://i.pravatar.cc/100?img=15" },
  { name: "Diana P.", score: "12km", img: "https://i.pravatar.cc/100?img=20" },
];

// Recent activities
export const recentActivities: Activity[] = [
  {
    id: 1,
    name: "Morning Walk",
    icon: "footprints",
    time: "7:00 AM",
    date: "Today",
    duration: "25 mins",
    bgColor: "rgba(0, 242, 255, 0.1)",
    iconColor: "var(--primary)",
  },
  {
    id: 2,
    name: "Seawall Ride",
    icon: "bike",
    time: "5:30 PM",
    date: "Yesterday",
    duration: "45 mins",
    bgColor: "rgba(42, 255, 93, 0.1)",
    iconColor: "var(--accent)",
  },
  {
    id: 3,
    name: "Quarry Rock",
    icon: "mountain",
    time: "10:00 AM",
    date: "Oct 10",
    duration: "1h 20m",
    bgColor: "rgba(255, 170, 0, 0.1)",
    iconColor: "var(--highlight)",
  },
];

// Activity types for logging
export const activityTypes = [
  { id: "walk", name: "Walk", icon: "footprints" },
  { id: "run", name: "Run", icon: "activity" },
  { id: "cycle", name: "Cycle", icon: "bike" },
  { id: "hike", name: "Hike", icon: "mountain" },
  { id: "atv", name: "ATV", icon: "car" },
  { id: "mtb", name: "Mtn Bike", icon: "bike" },
  { id: "paddle", name: "Paddle", icon: "anchor" },
  { id: "climb", name: "Climb", icon: "mountain" },
  { id: "other", name: "Other", icon: "more-horizontal" },
];

// User stats
export const userStats = {
  streak: 12,
  totalDays: 60,
  steps: "124k",
  minutes: 840,
  kilometers: 58,
  badges: 12,
  avgPace: "5:30",
};

// Badges
export const badges = [
  {
    id: 1,
    name: "Early Bird",
    desc: "Logged activity before 7AM",
    date: "Oct 12, 2024",
    icon: "sun",
    earned: true,
  },
  {
    id: 2,
    name: "Hiker",
    desc: "Logged 50km of hiking",
    date: "Sept 20, 2024",
    icon: "mountain",
    earned: true,
  },
  {
    id: 3,
    name: "Rain or Shine",
    desc: "Logged activity in the rain",
    date: "Nov 1, 2024",
    icon: "cloud-rain",
    earned: true,
  },
  {
    id: 4,
    name: "Mountain Goat",
    desc: "Climb 500m elevation",
    date: "Locked",
    icon: "mountain",
    earned: false,
  },
];

// Featured giveaway image
export const giveawayImage =
  "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&q=80";

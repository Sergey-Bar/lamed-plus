import type { LucideIcon } from 'lucide-react'
import {
  Accessibility,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Award,
  BadgeCheck,
  BarChart3,
  Bike,
  BookOpen,
  Bookmark,
  Brain,
  Bus,
  Calendar,
  Car,
  ChartColumn,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  CirclePlay,
  CircleX,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Compass,
  Crown,
  Download,
  Flag,
  FlagTriangleRight,
  Flame,
  Gauge,
  Globe,
  GraduationCap,
  Heart,
  House,
  Info,
  LayoutGrid,
  Lightbulb,
  ListChecks,
  Lock,
  LogOut,
  Map,
  Medal,
  Monitor,
  Moon,
  Pause,
  PartyPopper,
  Play,
  RefreshCw,
  RotateCcw,
  Route,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Signpost,
  Snowflake,
  Sparkles,
  SquarePen,
  Star,
  Sun,
  Target,
  Timer,
  Tractor,
  Trash2,
  TrendingUp,
  Trophy,
  Truck,
  TriangleAlert,
  Upload,
  User,
  Users,
  Vibrate,
  Volume2,
  VolumeX,
  WifiOff,
  X,
  Zap,
} from 'lucide-react'

export type IconName =
  | 'heart'
  | 'bolt'
  | 'star'
  | 'flame'
  | 'shield'
  | 'shield-check'
  | 'hint'
  | 'fifty'
  | 'freeze'
  | 'check'
  | 'check-circle'
  | 'check-check'
  | 'x'
  | 'x-circle'
  | 'lock'
  | 'trophy'
  | 'book'
  | 'play'
  | 'play-circle'
  | 'pause'
  | 'timer'
  | 'flag'
  | 'flag-checkered'
  | 'crown'
  | 'target'
  | 'chart'
  | 'gear'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'reload'
  | 'download'
  | 'upload'
  | 'trash'
  | 'sparkle'
  | 'confetti'
  | 'home'
  | 'study'
  | 'practice'
  | 'review'
  | 'exam'
  | 'arrow-forward'
  | 'arrow-back'
  | 'arrow-up-right'
  | 'arrow-left-right'
  | 'close'
  | 'alert'
  | 'info'
  | 'medal'
  | 'seal'
  | 'clipboard'
  | 'sign'
  | 'traffic-sign'
  | 'steering'
  | 'graduation'
  | 'clock'
  | 'sun'
  | 'moon'
  | 'monitor'
  | 'globe'
  | 'zoom'
  | 'bookmark'
  | 'share'
  | 'calendar'
  | 'road'
  | 'map'
  | 'car'
  | 'motorcycle'
  | 'truck'
  | 'bus'
  | 'tractor'
  | 'guide'
  | 'search'
  | 'volume'
  | 'mute'
  | 'vibrate'
  | 'gauge'
  | 'user'
  | 'users'
  | 'stats'
  | 'award'
  | 'brain'
  | 'compass'
  | 'edit'
  | 'logout'
  | 'help'
  | 'list'
  | 'wifi-off'
  | 'trending-up'
  | 'accessibility'

const ICONS: Record<IconName, LucideIcon> = {
  heart: Heart,
  bolt: Zap,
  star: Star,
  flame: Flame,
  shield: ShieldCheck,
  'shield-check': ShieldCheck,
  hint: Lightbulb,
  fifty: LayoutGrid,
  freeze: Snowflake,
  check: Check,
  'check-circle': CircleCheck,
  'check-check': CheckCheck,
  x: X,
  'x-circle': CircleX,
  lock: Lock,
  trophy: Trophy,
  book: BookOpen,
  play: Play,
  'play-circle': CirclePlay,
  pause: Pause,
  timer: Timer,
  flag: Flag,
  'flag-checkered': FlagTriangleRight,
  crown: Crown,
  target: Target,
  chart: ChartColumn,
  gear: Settings,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-down': ChevronDown,
  reload: RefreshCw,
  download: Download,
  upload: Upload,
  trash: Trash2,
  sparkle: Sparkles,
  confetti: PartyPopper,
  home: House,
  study: GraduationCap,
  practice: Gauge,
  review: RotateCcw,
  exam: ClipboardCheck,
  'arrow-forward': ArrowRight,
  'arrow-back': ArrowLeft,
  'arrow-up-right': ArrowUpRight,
  'arrow-left-right': ArrowLeftRight,
  close: X,
  alert: TriangleAlert,
  info: Info,
  medal: Medal,
  seal: BadgeCheck,
  clipboard: ClipboardList,
  sign: Signpost,
  'traffic-sign': TriangleAlert,
  steering: Car,
  graduation: GraduationCap,
  clock: Clock,
  sun: Sun,
  moon: Moon,
  monitor: Monitor,
  globe: Globe,
  zoom: Search,
  bookmark: Bookmark,
  share: Share2,
  calendar: Calendar,
  road: Route,
  map: Map,
  car: Car,
  motorcycle: Bike,
  truck: Truck,
  bus: Bus,
  tractor: Tractor,
  guide: Compass,
  search: Search,
  volume: Volume2,
  mute: VolumeX,
  vibrate: Vibrate,
  gauge: Gauge,
  user: User,
  users: Users,
  stats: BarChart3,
  award: Award,
  brain: Brain,
  compass: Compass,
  edit: SquarePen,
  logout: LogOut,
  help: CircleHelp,
  list: ListChecks,
  'wifi-off': WifiOff,
  'trending-up': TrendingUp,
  accessibility: Accessibility,
}

interface IconProps {
  name: IconName
  className?: string
  label?: string
  weight?: 'regular' | 'bold' | 'fill' | 'duotone'
}

export function Icon({ name, className, label, weight = 'bold' }: IconProps) {
  const Comp = ICONS[name]
  const strokeWidth = weight === 'regular' ? 1.8 : weight === 'bold' ? 2.2 : 2.4
  return (
    <Comp
      className={className}
      strokeWidth={strokeWidth}
      aria-hidden={label ? undefined : true}
      focusable={false}
      {...(label ? { 'aria-label': label, role: 'img' as const } : {})}
    />
  )
}

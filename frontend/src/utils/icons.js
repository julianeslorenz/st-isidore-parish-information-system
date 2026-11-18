// Maps the prototype's hand-drawn icon names to the closest lucide-react icon.
import {
  Award, BarChart3, Bell, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Church,
  Clock, Download, Droplet, Eye, EyeOff, FileText, Flame, Gem, Home, Info, LayoutDashboard, Leaf,
  Lock, LogOut, Mail, MapPin, Menu, MessageSquare, Paperclip, Pencil, Plus, Printer, Search,
  Send, Settings, ShieldCheck, Star, Trash2, Upload, User, Users, X, TriangleAlert,
} from 'lucide-react';

export const Icons = {
  dash: LayoutDashboard, home: Home, file: FileText, cal: CalendarDays, users: Users, user: User,
  award: Award, mail: Mail, bell: Bell, search: Search, plus: Plus, check: Check, x: X, clock: Clock,
  download: Download, eye: Eye, eyeOff: EyeOff, print: Printer, chL: ChevronLeft, chR: ChevronRight,
  chD: ChevronDown, menu: Menu, lock: Lock, logout: LogOut, upload: Upload, pin: MapPin, send: Send,
  clip: Paperclip, chart: BarChart3, gear: Settings, info: Info, alert: TriangleAlert,
  msg: MessageSquare, shield: ShieldCheck, edit: Pencil, trash: Trash2, church: Church, star: Star,
  drop: Droplet, ring: Gem, flame: Flame, leaf: Leaf,
};

// One icon per sacrament, as used by the prototype's service cards.
export const SACRAMENT_ICONS = {
  Baptism: Droplet,
  Marriage: Gem,
  Confirmation: Flame,
  Funeral: Leaf,
};

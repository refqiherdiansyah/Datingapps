'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Heart, Calendar, Camera, Gamepad2, MoreHorizontal,
  LayoutDashboard, DollarSign, BookOpen, Star, Music,
  Cloud, Map, Film, Gift, Target, Lock, Utensils,
} from 'lucide-react'
import { useState } from 'react'

const mainNav = [
  { href: '/dashboard',  icon: LayoutDashboard, label: 'Home' },
  { href: '/planner',    icon: Heart,            label: 'Planner' },
  { href: '/scrapbook',  icon: Camera,           label: 'Scrapbook' },
  { href: '/games',      icon: Gamepad2,         label: 'Games' },
  { href: '#more',       icon: MoreHorizontal,   label: 'More' },
]

const moreMenu = [
  { href: '/restaurant', icon: Utensils, label: 'Restaurant' },
  { href: '/movies',     icon: Film,     label: 'Movies' },
  { href: '/budget',     icon: DollarSign, label: 'Budget' },
  { href: '/calendar',   icon: Calendar, label: 'Calendar' },
  { href: '/notes',      icon: Lock,     label: 'Secret Notes' },
  { href: '/progress',   icon: Target,   label: 'Progress' },
]

export default function Navigation() {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  if (pathname.startsWith('/auth') || pathname === '/') return null

  return (
    <>
      {/* More drawer */}
      {showMore && (
        <div
          className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm"
          onClick={() => setShowMore(false)}
        />
      )}
      <div
        className={`fixed bottom-[72px] left-4 right-4 z-50 bg-white rounded-2xl shadow-rose-lg
                    border border-primary-100 overflow-hidden
                    transition-all duration-300 ease-in-out
                    ${showMore ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        <p className="px-4 pt-4 pb-2 text-xs font-semibold text-ink-muted uppercase tracking-widest">
          More features
        </p>
        <div className="grid grid-cols-3 gap-1 p-2">
          {moreMenu.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setShowMore(false)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all
                ${pathname.startsWith(href)
                  ? 'bg-primary-50 text-primary-400'
                  : 'text-ink-muted hover:bg-primary-50/60'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
        <div className="h-2" />
      </div>

      {/* Bottom navigation bar */}
      <nav className="bottom-nav">
        {mainNav.map(({ href, icon: Icon, label }) => {
          const isMore = href === '#more'
          const isActive = isMore
            ? showMore || moreMenu.some(m => pathname.startsWith(m.href))
            : pathname.startsWith(href)

          if (isMore) {
            return (
              <button
                key={label}
                onClick={() => setShowMore(v => !v)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <div className={`p-1.5 rounded-xl transition-colors
                  ${isActive ? 'bg-primary-100' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            )
          }

          return (
            <Link
              key={href}
              href={href}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <div className={`p-1.5 rounded-xl transition-colors
                ${isActive ? 'bg-primary-100' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}

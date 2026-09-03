import Link from 'next/link'

type NavigationBarProps = {
  activeSection?: 'overview' | 'checkout' | 'support' | 'specs'
}

export function NavigationBar({
  activeSection = 'overview',
}: NavigationBarProps) {
  return (
    <header className='sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/90 backdrop-blur-md'>
      <div className='mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center gap-8'>
          <Link href='/' className='flex items-center gap-2.5 group'>
            <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-black text-white transition-transform group-hover:scale-105'>
              <svg
                width='15'
                height='15'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <polygon points='3 11 22 2 13 21 11 13 3 11' />
              </svg>
            </div>
            <span className='font-semibold text-base tracking-tight text-black'>
              Waypoint
            </span>
          </Link>

          <nav className='hidden md:flex items-center gap-6 text-[13px] font-medium text-zinc-600'>
            <Link
              href='/'
              className={`transition-colors hover:text-black ${
                activeSection === 'overview' ? 'text-black font-semibold' : ''
              }`}
            >
              Overview
            </Link>
            <Link
              href='/checkout'
              className={`transition-colors hover:text-black ${
                activeSection === 'checkout' ? 'text-black font-semibold' : ''
              }`}
            >
              Customer View
            </Link>
            <Link
              href='/support'
              className={`transition-colors hover:text-black ${
                activeSection === 'support' ? 'text-black font-semibold' : ''
              }`}
            >
              Support Console
            </Link>
          </nav>
        </div>

        <div className='flex items-center gap-3'>
          <div className='hidden sm:flex items-center gap-2 rounded-full border border-zinc-200/80 bg-zinc-50/70 px-3 py-1 text-xs text-zinc-500 font-mono'>
            <span className='h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse' />
            <span>webmcp:document.modelContext</span>
          </div>

          <Link
            href='/checkout'
            className='rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white transition-all hover:bg-zinc-800 active:scale-95 shadow-sm'
          >
            Start Live Session
          </Link>
        </div>
      </div>
    </header>
  )
}

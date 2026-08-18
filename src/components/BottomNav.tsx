'use client';

import { usePathname, useRouter } from 'next/navigation';
import { MessageCircle, Settings } from 'lucide-react';

const tabs = [
  { id: 'chat', label: '聊天', icon: MessageCircle, href: '/chat' },
  { id: 'settings', label: '设置', icon: Settings, href: '/settings' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white">
      <div className="mx-auto flex h-14 max-w-md items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.href)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 transition-colors ${
                isActive ? 'text-black' : 'text-gray-300'
              }`}
              aria-label={tab.label}
            >
              <tab.icon size={21} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

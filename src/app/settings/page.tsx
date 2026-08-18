'use client';

import { useRouter } from 'next/navigation';
import { Key, User, Palette } from 'lucide-react';

const settingItems = [
  {
    id: 'api',
    label: 'API 配置',
    description: '管理接口地址、密钥和模型预设',
    icon: Key,
    href: '/settings/api',
  },
  {
    id: 'profile',
    label: '角色信息',
    description: 'AI 人设、头像、名字',
    icon: User,
    href: '/settings/profile',
  },
  {
    id: 'theme',
    label: '外观',
    description: '主题和显示偏好',
    icon: Palette,
    href: '/settings/theme',
  },
];

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="px-4 py-6">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-xl font-semibold text-gray-900">设置</h1>
        <div className="flex flex-col gap-2">
          {settingItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className="flex items-center gap-4 rounded-xl bg-gray-50 px-4 py-3.5 text-left transition-colors hover:bg-gray-100 active:bg-gray-100"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-200">
                <item.icon size={18} className="text-gray-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-gray-900">{item.label}</p>
                <p className="text-[13px] text-gray-400">{item.description}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-300 shrink-0"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

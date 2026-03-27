'use client';

import { Bell, Search, User, Settings, HelpCircle, LogOut } from 'lucide-react';

export default function AdminHeader({
  title = 'لوحة التحكم الرئيسية',
  subtitle = 'نظرة عامة شاملة على النظام وإدارة النشاط',
  searchPlaceholder = 'بحث...',
  role = 'المدير',
  status ='متصل الان'
}: {
  title?: string;
  subtitle?: string;
    searchPlaceholder?: string;
    role?: string;
    status?: string;
}) {
  return (
    <header
      dir='rtl'
      lang='ar'
      className='flex h-[90px] w-full items-center justify-between bg-white border-b border-gray-200 px-6'
    >
      {/* start Section - Title */}
      <section>
        <div className='font-cairo text-[20px] font-black leading-[26px] text-[#111827]'>
          {title}
        </div>
        <div className='mt-1 font-cairo text-[12px] font-semibold leading-[14px] text-[#98A2B3]'>
          {subtitle}
        </div>
      </section>
      {/* Left Section - Search */}
      <div className='flex items-center gap-4'>
        <div className='relative w-[320px]'>
          <input
            type='text'
            placeholder={searchPlaceholder}
            className='h-[44px] w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm font-medium text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
          />
          <div className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400'>
            <Search className='h-5 w-5' />
          </div>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className='flex items-center gap-3'>
        {/* Help Button */}
        <button
          type='button'
          className='flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors'
          aria-label='المساعدة'
        >
          <HelpCircle className='h-5 w-5 text-gray-600' />
        </button>

        {/* Notifications */}
        <button
          type='button'
          className='relative flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors'
          aria-label='الإشعارات'
        >
          <Bell className='h-5 w-5 text-gray-600' />
          <span className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white'>
            3
          </span>
        </button>

        {/* Settings */}
        <button
          type='button'
          className='flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors'
          aria-label='الإعدادات'
        >
          <Settings className='h-5 w-5 text-gray-600' />
        </button>
        {/* speart */}
        <div className='h-[40px] w-[0.8px] bg-gray-200' /> 
        {/* User Profile */}
        <div className='flex items-center gap-3 px-3 py-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100'>
            <User className='h-4 w-4 text-blue-600' />
          </div>
          <div className='text-right'>
            <div className='text-sm font-medium text-gray-900'>{role}</div>
            <div className='text-xs text-gray-500'>{status}</div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type='button'
          className='flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors'
          aria-label='تسجيل الخروج'
        >
          <LogOut className='h-5 w-5 text-gray-600' />
        </button>
      </div>
    </header>
  );
}

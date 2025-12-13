'use client';

import SimpleBar from '@core/ui/simplebar';
import ThemeSwitcher from '@/layouts/settings/theme-switcher';

export default function SettingsDrawer() {
  return (
    <>
      <SimpleBar className="h-[calc(100%-138px)]">
        <div className="px-5 py-6">
          <ThemeSwitcher />
        </div>
      </SimpleBar>
    </>
  );
}


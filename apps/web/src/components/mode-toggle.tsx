import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from './theme-provider.js';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="relative inline-flex items-center justify-center rounded-lg p-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50 border border-slate-200 dark:border-slate-800 transition-colors">
          <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="z-50 min-w-[8rem] overflow-hidden rounded-lg border border-slate-200 bg-white p-1 text-slate-950 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
        >
          <DropdownMenu.Item
            onClick={() => setTheme('light')}
            className="relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-1.5 text-xs outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 gap-2 font-medium"
          >
            <Sun className="h-3.5 w-3.5" />
            <span>Light</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onClick={() => setTheme('dark')}
            className="relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-1.5 text-xs outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 gap-2 font-medium"
          >
            <Moon className="h-3.5 w-3.5" />
            <span>Dark</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onClick={() => setTheme('system')}
            className="relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-1.5 text-xs outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 gap-2 font-medium"
          >
            <Laptop className="h-3.5 w-3.5" />
            <span>System</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

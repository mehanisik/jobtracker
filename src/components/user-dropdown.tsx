import { LogOut, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface UserDropdownProps {
  collapsed?: boolean;
  userEmail?: string | null;
  onSignOut: () => Promise<void>;
}

export default function UserDropdown({ collapsed, userEmail, onSignOut }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const truncateEmail = (email: string | null) => {
    if (!email) return '';
    if (email.length > 20) {
      const [username, domain] = email.split('@');
      return `${username.slice(0, 10)}...@${domain}`;
    }
    return email;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        type='button'
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
        className='flex items-center gap-2 focus:outline-none'
      >
        <div className='bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full'>
          <User className='h-4 w-4' />
        </div>
        {!collapsed && userEmail && (
          <span className='max-w-[150px] truncate text-sm'>{truncateEmail(userEmail)}</span>
        )}
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg'>
          <button
            type='button'
            onClick={onSignOut}
            className='text-destructive hover:bg-destructive/10 flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors'
          >
            <LogOut className='h-4 w-4' />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

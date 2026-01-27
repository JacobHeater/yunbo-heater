'use client';

import Link from 'next/link';
import Button from './Button';
import Calligraphy from './Calligraphy';

export default function Header() {
  return (
    <header className="bg-[#E8DDEA] border-b border-foreground/10 sticky top-0 z-50">
      <div className="container py-4 grid grid-cols-2 items-center">
        <div className="flex flex-col items-start gap-1">
          <Link href="/" className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <Calligraphy>Yunbo Heater</Calligraphy>
            <span className="text-center sm:text-left text-foreground/60 whitespace-nowrap">Piano Studio</span>
          </Link>
        </div>

        <div className="flex justify-end">
          <Button
            href="/piano/lessons"
            size="sm"
          >
            Start Lessons
          </Button>
        </div>
      </div>
    </header>
  );
}
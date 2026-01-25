'use client';

import { useState } from 'react';
import Button from './Button';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-[#E8DDEA] border-b border-foreground/10 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-16 py-4 flex items-center justify-between">
        <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4">
          <h1 className="text-2xl font-bold text-foreground tracking-widest whitespace-nowrap" style={{ fontFamily: 'var(--font-ballet)' }}>Yunbo Heater</h1>
          <span className="text-foreground/60 text-center">Piano Studio</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          <a href="/" className="text-foreground hover:text-foreground/80 transition-colors">Home</a>
          <a href="/piano" className="text-foreground hover:text-foreground/80 transition-colors">Piano Lessons</a>
          <a href="#about" className="text-foreground hover:text-foreground/80 transition-colors">About</a>
          <a href="#contact" className="text-foreground hover:text-foreground/80 transition-colors">Contact</a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex flex-col space-y-1 p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`w-6 h-0.5 bg-foreground transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`w-6 h-0.5 bg-foreground transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`w-6 h-0.5 bg-foreground transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
        </button>

        {/* Mobile Navigation */}
        <div className={`md:hidden absolute top-full left-0 right-0 bg-[#DFD4E1] border-b border-foreground/10 shadow-lg overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <nav className="flex flex-col space-y-4 p-4">
            <a href="/" className="text-foreground hover:text-foreground/80 transition-colors text-center" onClick={() => setIsMenuOpen(false)}>Home</a>
            <a href="/piano" className="text-foreground hover:text-foreground/80 transition-colors text-center" onClick={() => setIsMenuOpen(false)}>Piano Lessons</a>
            <a href="#about" className="text-foreground hover:text-foreground/80 transition-colors text-center" onClick={() => setIsMenuOpen(false)}>About</a>
            <a href="#contact" className="text-foreground hover:text-foreground/80 transition-colors text-center" onClick={() => setIsMenuOpen(false)}>Contact</a>
            <Button
              href="mailto:contact@yunboheater.com"
              size="sm"
              onClick={() => setIsMenuOpen(false)}
            >
              Get Started
            </Button>
          </nav>
        </div>

        {/* Desktop Get Started Button */}
        <Button
          href="mailto:contact@yunboheater.com"
          size="sm"
          className="hidden md:inline-flex"
        >
          Get Started
        </Button>
      </div>
    </header>
  );
}
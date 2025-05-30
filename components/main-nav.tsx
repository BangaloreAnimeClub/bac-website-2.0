"use client";

import { siteConfig } from "@/config/site";
import { Icons } from "./icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signIn, signOut, useSession } from "next-auth/react";
import { useUI } from "@/context/ui-context"; // Import useUI
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, X, ChevronDown } from "lucide-react";

export function MainNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { openLoginModal } = useUI(); // Get openLoginModal function
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Add a handler for search submit (to match MobileNav)
  const handleSearchSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (search.trim()) {
      router.push(`/search?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setShowSearchDropdown(false);
    }
  };

  return (
    <nav className="flex items-center justify-between w-full relative">
      <Link href="/" className="flex items-center space-x-2">
        <Icons.logo className="h-8 w-8" />
        <span className="font-bold">{siteConfig.name}</span>
      </Link>
      <Link
        href="/about"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary hidden sm:inline-block",
          pathname === "/about" ? "text-foreground" : "text-foreground/60"
        )}
      >
        About
      </Link>
      <Link
        href="/blog"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary hidden sm:inline-block",
          pathname === "/blog" ? "text-foreground" : "text-foreground/60"
        )}
      >
        Blog
      </Link>
      <Link
        href="/past-events"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary hidden sm:inline-block",
          pathname === "/past-events" ? "text-foreground" : "text-foreground/60"
        )}
      >
        Archives
      </Link>
      <Link
        href="/upcoming-events"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary hidden sm:inline-block",
          pathname === "/upcoming-events" ? "text-foreground" : "text-foreground/60"
        )}
      >
        Upcoming
      </Link>
      {/* Gallery dropdown */}
      <div className="relative group/gal hidden sm:inline-block focus-within:z-50 hover:z-50">
        <button
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary px-0 bg-transparent border-none outline-none cursor-pointer flex items-center gap-1",
            (pathname === "/art" || pathname === "/gallery") ? "text-foreground" : "text-foreground/60"
          )}
          tabIndex={0}
        >
          Gallery
          <ChevronDown className="w-4 h-4 ml-0.5 transition-transform group-hover/gal:rotate-180 group-focus-within/gal:rotate-180" />
        </button>
        <div className="absolute -left-8 mt-2 w-32 rounded-md shadow-lg bg-background border border-border
          opacity-0 translate-y-2 invisible
          group-hover/gal:opacity-100 group-hover/gal:translate-y-0 group-hover/gal:visible
          group-focus-within/gal:opacity-100 group-focus-within/gal:translate-y-0 group-focus-within/gal:visible
          transition-all duration-800 z-50 origin-top">
          <Link
            href="/art"
            className={cn(
              "block px-4 py-2 text-sm hover:bg-accent hover:text-primary transition-colors",
              pathname === "/art" ? "text-foreground font-semibold" : "text-foreground/80"
            )}
          >
            Art
          </Link>
          <Link
            href="/gallery"
            className={cn(
              "block px-4 py-2 text-sm hover:bg-accent hover:text-primary transition-colors",
              pathname === "/gallery" ? "text-foreground font-semibold" : "text-foreground/80"
            )}
          >
            Cosplay
          </Link>
        </div>
      </div>
      <Link
        href="/game"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary hidden sm:inline-block",
          pathname === "/game" ? "text-foreground" : "text-foreground/60"
        )}
      >
        Love Story
      </Link>
      <Link
        href="/socials"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary hidden sm:inline-block",
          pathname === "/socials" ? "text-foreground" : "text-foreground/60"
        )}
      >
        Socials
      </Link>
      <Link
        href="/contact-us"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary hidden sm:inline-block",
          pathname === "/contact-us" ? "text-foreground" : "text-foreground/60"
        )}
      >
        Contact
      </Link>
      {/* Desktop search bar (hidden below xl) */}
      <form
        onSubmit={handleSearchSubmit}
        className="relative hidden xl:block"
      >
        <Input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search blogs & events"
          className="min-w-[180px]"
        />
      </form>
      {/* Search icon for desktop only, when below xl (not on mobile) */}
      <div className="hidden md:block xl:hidden relative">
        <Button
          variant="outline"
          className="w-10 px-0"
          onClick={() => {
            setShowSearchDropdown(v => !v);
            setTimeout(() => searchInputRef.current?.focus(), 100);
          }}
          aria-label={showSearchDropdown ? "Close search bar" : "Open search bar"}
        >
          {showSearchDropdown ? <X className="h-6 w-6" /> : <Search className="h-6 w-6" />}
        </Button>
        {showSearchDropdown && (
          <div
            className="absolute top-full mt-2 right-0 w-[90vw] max-w-lg z-50 bg-background shadow-lg p-4 border-b border-border"
          >
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <Input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search blogs & events"
                className="flex-grow h-10"
                autoFocus
              />
              <Button type="submit" variant="default" size="icon" className="h-10 w-10 flex-shrink-0">
                <Search className="h-5 w-5" />
              </Button>
            </form>
          </div>
        )}
      </div>
      <div className="hidden md:block">
        {session ? (
          <button
            onClick={() => signOut()}
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={openLoginModal}
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-sm font-medium hover:bg-primary/80 transition-colors"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

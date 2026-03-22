"use client";

import { ExternalLink, LogOut } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { DEFAULT_SLUG } from "@/lib/constants";

interface AdminHeaderProps {
  userName: string;
  userAvatar?: string;
}

export function AdminHeader({ userName, userAvatar }: AdminHeaderProps) {
  const { signOut } = useAuth();
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card/95 px-6 backdrop-blur-sm">
      {/* Espaçador mobile (hamburger futuro) */}
      <div className="lg:hidden" />

      {/* Ações */}
      <div className="flex items-center gap-3 ml-auto">
        <Button variant="outline" size="sm" asChild>
          <Link
            href={`/${DEFAULT_SLUG}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver página
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {userAvatar && <AvatarImage src={userAvatar} alt={userName} />}
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium text-foreground sm:block">
            {userName.split(" ")[0]}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={signOut}
          aria-label="Sair"
          className="text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

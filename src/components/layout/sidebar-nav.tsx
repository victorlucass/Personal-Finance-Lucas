"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  CreditCard,
  ArrowRightLeft,
  DollarSign,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowRightLeft },
  { href: "/credit-card", label: "Credit Card", icon: CreditCard },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const userAvatar = PlaceHolderImages.find((p) => p.id === "user-avatar");

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden">
            <SidebarTrigger />
          </Button>
          <DollarSign className="size-8 text-primary" />
          {state === "expanded" && (
            <h1 className="text-lg font-semibold text-sidebar-foreground">
              Finance Gazer
            </h1>
          )}
        </div>
      </SidebarHeader>

      <SidebarMenu className="flex-1">
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} legacyBehavior passHref>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label }}
              >
                <a>
                  <item.icon />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>

      <SidebarFooter>
        <div className="flex items-center gap-3 p-2">
          <Avatar>
            {userAvatar && <AvatarImage
              src={userAvatar.imageUrl}
              alt={userAvatar.description}
              data-ai-hint={userAvatar.imageHint}
            />}
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          {state === "expanded" && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">
                User
              </span>
              <span className="text-xs text-sidebar-foreground/70">
                user@email.com
              </span>
            </div>
          )}
        </div>
      </SidebarFooter>
    </>
  );
}

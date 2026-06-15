"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Check, Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import MobileNav from "./MobileNav";
import { toast } from "sonner";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function Topbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Derive page title from path
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Executive Summary";
    const segment = pathname.split("/")[1];
    if (!segment) return "Overview";
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchNotifications();
    // Refresh notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id?: string, all = false) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(all ? { markAllRead: true } : { id }),
      });

      if (res.ok) {
        if (all) {
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
          setUnreadCount(0);
          toast.success("All notifications marked as read");
        } else {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
          );
          setUnreadCount((c) => Math.max(0, c - 1));
        }
      }
    } catch (error) {
      toast.error("Failed to update notification");
    }
  };

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md sticky top-0 z-40">
      {/* Mobile nav trigger & Title */}
      <div className="flex items-center space-x-4">
        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className="border-border bg-transparent text-muted-foreground hover:bg-muted md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-64 border-r border-border bg-sidebar p-0">
            <MobileNav />
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-bold text-foreground tracking-wide">{getPageTitle()}</h1>
      </div>

      {/* Theme Toggle & Notifications bell */}
      <div className="flex items-center space-x-2">
        {mounted && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="border-border bg-transparent text-muted-foreground hover:bg-muted"
            title="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-500 animate-pulse" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className="relative border-border bg-transparent text-muted-foreground hover:bg-muted"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-650 text-[9px] font-bold text-white ring-2 ring-background">
                    {unreadCount}
                  </span>
                )}
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-80 border-border bg-popover text-popover-foreground">
            <div className="flex items-center justify-between px-4 py-2">
              <DropdownMenuLabel className="p-0 text-foreground font-semibold text-sm">Notifications</DropdownMenuLabel>
              {unreadCount > 0 && (
                <button
                  onClick={() => handleMarkAsRead(undefined, true)}
                  className="text-xs text-indigo-500 hover:text-indigo-400 font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>
            <DropdownMenuSeparator className="bg-border" />
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">No notifications yet</div>
              ) : (
                notifications.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    className="flex flex-col items-start px-4 py-2.5 focus:bg-muted focus:text-foreground cursor-pointer"
                    onClick={() => !item.isRead && handleMarkAsRead(item.id)}
                  >
                    <div className="flex w-full items-start justify-between">
                      <span className={`text-xs font-semibold ${item.isRead ? "text-muted-foreground" : "text-foreground"}`}>
                        {item.title}
                      </span>
                      {!item.isRead && (
                        <span className="h-2 w-2 rounded-full bg-indigo-500 mt-1" />
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground leading-normal">{item.message}</p>
                    <span className="mt-1 text-[9px] text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </DropdownMenuItem>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

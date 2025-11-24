"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/sidebar";

export default function ResponsiveSidebar() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            {/* Mobile hamburger button */}
            <Button
                variant="ghost"
                className="absolute top-4 left-4 md:hidden z-50"
                onClick={() => setSidebarOpen(true)}
            >
                <Menu className="h-6 w-6" />
            </Button>

            {/* Sidebar overlay for mobile */}
            <div
                className={`fixed inset-0 z-40 bg-gray-900 bg-opacity-75 transition-opacity ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"} md:hidden`}
                onClick={() => setSidebarOpen(false)}
            >
                <div
                    className="h-full w-72 bg-gray-900 text-white p-4 overflow-y-auto flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Button variant="ghost" className="mb-4 self-end" onClick={() => setSidebarOpen(false)}>
                        <X className="h-6 w-6" />
                    </Button>
                    <Sidebar />
                </div>
            </div>
        </>
    );
}

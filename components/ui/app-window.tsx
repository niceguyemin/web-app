import React from "react";

export function AppWindow({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-[1600px] h-[90vh] md:h-[85vh] flex flex-col glass-panel rounded-2xl overflow-hidden relative ring-1 ring-white/10 shadow-2xl">
                {/* Title Bar */}
                <div className="h-10 bg-white/5 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 shrink-0 select-none">
                    <div className="window-controls">
                        <div className="window-control control-red" />
                        <div className="window-control control-yellow" />
                        <div className="window-control control-green" />
                    </div>
                    <div className="text-xs font-medium text-white/50 tracking-wide">
                        Antigravity
                    </div>
                    <div className="w-14" /> {/* Spacer for centering */}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative">
                    {children}
                </div>
            </div>
        </div>
    );
}

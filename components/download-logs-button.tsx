"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function DownloadLogsButton({ variant = "default", size = "default" }: { variant?: string; size?: string }) {
    const handleDownload = async () => {
        try {
            const response = await fetch("/api/logs/export");
            if (!response.ok) throw new Error("Export failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `system-logs-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download error:", error);
            alert("Kayıtlar indirilemedi!");
        }
    };

    return (
        <Button
            onClick={handleDownload}
            variant={variant as any}
            size={size as any}
            className="gap-2"
        >
            <Download className="h-4 w-4" />
            Kayıtları İndir
        </Button>
    );
}

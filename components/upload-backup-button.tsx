"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CloudUpload, Loader2 } from "lucide-react";

type UploadBackupButtonProps = {
    variant?: string;
    size?: string;
    showLabel?: boolean;
};

export function UploadBackupButton({ variant = "default", size = "default", showLabel = true }: UploadBackupButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/backup", { method: "POST" });
            if (!response.ok) {
                throw new Error("Drive backup failed");
            }
            const data = await response.json();
            alert(`Yedek Google Drive'a yüklendi.${data?.name ? ` Dosya: ${data.name}` : ""}`);
        } catch (error) {
            console.error("Drive backup error:", error);
            alert("Drive yedekleme başarısız oldu!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleUpload}
            variant={variant as any}
            size={size as any}
            disabled={loading}
            className="gap-2"
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
            {showLabel && (loading ? "Yedekleniyor..." : "Drive'a Yedekle")}
        </Button>
    );
}

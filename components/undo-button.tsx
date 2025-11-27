"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { undoLog } from "@/app/actions/log";
import { toast } from "sonner";
import { useState } from "react";

interface UndoButtonProps {
    logId: number;
}

export function UndoButton({ logId }: UndoButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleUndo = async () => {
        try {
            setLoading(true);
            await undoLog(logId);
            toast.success("İşlem başarıyla geri alındı");
        } catch (error) {
            console.error("Undo failed:", error);
            toast.error("İşlem geri alınamadı");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            className="hover:bg-red-500/20 hover:text-red-400 rounded-lg gap-2"
            title="İşlemi Geri Al"
            onClick={handleUndo}
            disabled={loading}
        >
            <RotateCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Geri Alınıyor..." : "Geri Al"}</span>
        </Button>
    );
}

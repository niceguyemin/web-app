"use client";

import { deleteUser } from "@/app/actions/user";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { toast } from "sonner";

interface DeleteUserButtonProps {
    userId: number;
}

export function DeleteUserButton({ userId }: DeleteUserButtonProps) {
    return (
        <Button
            variant="ghost"
            size="sm"
            className="hover:bg-red-500/20 hover:text-red-400 rounded-lg"
            onClick={async () => {
                if (confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) {
                    try {
                        const formData = new FormData();
                        formData.append("id", userId.toString());
                        await deleteUser(formData);
                        toast.success("Kullanıcı başarıyla silindi");
                    } catch (error) {
                        toast.error("Kullanıcı silinemedi");
                    }
                }
            }}
        >
            <Trash className="h-4 w-4" />
        </Button>
    );
}

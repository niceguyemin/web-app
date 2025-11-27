"use client";

import { toggleServiceType, deleteServiceType } from "@/app/actions/servicetype";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { toast } from "sonner";

interface ServiceTypeActionsProps {
    serviceId: number;
    isActive: boolean;
}

export function ServiceTypeActions({ serviceId, isActive }: ServiceTypeActionsProps) {
    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className="mr-2"
                onClick={async () => {
                    try {
                        const formData = new FormData();
                        formData.append("id", serviceId.toString());
                        formData.append("active", (!isActive).toString());
                        await toggleServiceType(formData);
                        toast.success(isActive ? "Hizmet pasifleştirildi" : "Hizmet aktifleştirildi");
                    } catch (error) {
                        toast.error("İşlem başarısız");
                    }
                }}
            >
                {isActive ? "Pasifleştir" : "Aktifleştir"}
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                    if (confirm("Bu hizmet türünü silmek istediğinize emin misiniz?")) {
                        try {
                            const formData = new FormData();
                            formData.append("id", serviceId.toString());
                            await deleteServiceType(formData);
                            toast.success("Hizmet türü silindi");
                        } catch (error) {
                            toast.error("Silme işlemi başarısız");
                        }
                    }
                }}
            >
                <Trash className="h-4 w-4 text-red-500" />
            </Button>
        </>
    );
}

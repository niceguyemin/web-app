"use client";

import { createServiceType } from "@/app/actions/servicetype";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRef } from "react";

export function ServiceTypeForm() {
    const formRef = useRef<HTMLFormElement>(null);

    return (
        <form
            ref={formRef}
            action={async (formData) => {
                try {
                    await createServiceType(formData);
                    toast.success("Hizmet türü başarıyla oluşturuldu");
                    formRef.current?.reset();
                } catch (error) {
                    toast.error("Hizmet türü oluşturulurken hata oluştu");
                }
            }}
            className="flex gap-4 items-end"
        >
            <div className="grid gap-2 flex-1 max-w-sm">
                <Label>Hizmet Adı</Label>
                <Input name="name" placeholder="Örn: Masaj Terapisi" required />
            </div>
            <Button type="submit">Ekle</Button>
        </form>
    );
}

"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export function DateTimeDisplay() {
    const [date, setDate] = useState<Date | null>(null);

    useEffect(() => {
        setDate(new Date());
        const timer = setInterval(() => {
            setDate(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!date) return null;

    return (
        <div className="text-text-muted text-sm md:text-base font-medium" suppressHydrationWarning>
            {format(date, "d MMMM yyyy, EEEE HH:mm", { locale: tr })}
        </div>
    );
}

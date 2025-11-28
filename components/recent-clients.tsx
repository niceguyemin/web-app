import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { formatPhoneNumber } from "@/lib/utils";

interface RecentClientsProps {
    clients: {
        id: number;
        name: string;
        createdAt: Date;
        phone: string | null;
    }[];
}

export function RecentClients({ clients }: RecentClientsProps) {
    return (
        <div className="space-y-8">
            {clients.length === 0 ? (
                <p className="text-sm text-white/50 text-center">
                    Henüz kayıtlı danışan yok.
                </p>
            ) : (
                clients.map((client) => (
                    <div key={client.id} className="flex items-center">
                        <Avatar className="h-9 w-9 border border-white/10">
                            <AvatarFallback className="bg-primary/20 text-primary font-medium">
                                {client.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none text-white hover:text-primary transition-colors cursor-default">
                                {client.name}
                            </p>
                            <p className="text-xs text-white/50">
                                {formatPhoneNumber(client.phone)}
                            </p>
                        </div>
                        <div className="ml-auto text-xs text-white/50">
                            {format(new Date(client.createdAt), "d MMM", { locale: tr })}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

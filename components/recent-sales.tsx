import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface RecentSalesProps {
    payments: {
        id: number;
        amount: number;
        client: {
            name: string;
            email?: string; // Assuming we might have email, or just use name
        };
    }[];
}

export function RecentSales({ payments }: RecentSalesProps) {
    return (
        <div className="space-y-8">
            {payments.map((payment) => (
                <div key={payment.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>
                            {payment.client.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)
                                .toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {payment.client.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {/* Fallback text since we might not have email */}
                            Ödeme yaptı
                        </p>
                    </div>
                    <div className="ml-auto font-medium">
                        +₺{payment.amount.toFixed(2)}
                    </div>
                </div>
            ))}
            {payments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                    Henüz işlem yok.
                </p>
            )}
        </div>
    );
}

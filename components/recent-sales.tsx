import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface RecentSalesProps {
    payments: {
        id: number;
        amount: number;
        client: {
            name: string;
            email?: string;
        };
        date: Date;
    }[];
}

export function RecentSales({ payments }: RecentSalesProps) {
    return (
        <div className="space-y-8">
            {payments.length === 0 ? (
                <p className="text-sm text-white/50 text-center">
                    Henüz işlem yok.
                </p>
            ) : (
                payments.map((payment) => (
                    <div key={payment.id} className="flex items-center">
                        <Avatar className="h-9 w-9 border border-white/10">
                            <AvatarFallback className="bg-primary/20 text-primary font-medium">
                                {payment.client.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none text-white">
                                {payment.client.name}
                            </p>
                            <p className="text-xs text-white/50">
                                {new Date(payment.date).toLocaleDateString("tr-TR")}
                            </p>
                        </div>
                        <div className="ml-auto font-medium text-white">
                            +₺{payment.amount.toFixed(2)}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

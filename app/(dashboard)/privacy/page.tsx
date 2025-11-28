export default function PrivacyPage() {
    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Gizlilik Politikası</h1>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">1. Toplanan Veriler</h2>
                <p className="text-muted-foreground">
                    Uygulamamız aşağıdaki verileri toplar ve saklar:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Kullanıcı adı ve şifre (şifrelenmiş)</li>
                    <li>Danışan bilgileri (ad, telefon, notlar)</li>
                    <li>Randevu bilgileri</li>
                    <li>Ödeme kayıtları</li>
                    <li>Hizmet bilgileri</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">2. Veri Güvenliği</h2>
                <p className="text-muted-foreground">
                    Verileriniz güvenli bir şekilde saklanır:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Tüm şifreler bcrypt ile hash'lenir</li>
                    <li>HTTPS ile şifreli bağlantı</li>
                    <li>PostgreSQL veritabanı SSL ile korunur</li>
                    <li>Sadece yetkili kullanıcılar veriye erişebilir</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">3. Veri Kullanımı</h2>
                <p className="text-muted-foreground">
                    Toplanan veriler sadece aşağıdaki amaçlarla kullanılır:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Randevu yönetimi</li>
                    <li>Danışan takibi</li>
                    <li>Ödeme kayıtları</li>
                    <li>Bildirimler gönderme</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">4. Veri Paylaşımı</h2>
                <p className="text-muted-foreground">
                    Verileriniz üçüncü taraflarla <strong>paylaşılmaz</strong>.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">5. Kullanıcı Hakları</h2>
                <p className="text-muted-foreground">
                    Kullanıcılar aşağıdaki haklara sahiptir:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Verilerine erişim hakkı</li>
                    <li>Verilerin silinmesini talep etme hakkı</li>
                    <li>Verilerin düzeltilmesini talep etme hakkı</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">6. İletişim</h2>
                <p className="text-muted-foreground">
                    Gizlilik politikası ile ilgili sorularınız için: admin@example.com
                </p>
            </section>

            <section className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
                </p>
            </section>
        </div>
    );
}

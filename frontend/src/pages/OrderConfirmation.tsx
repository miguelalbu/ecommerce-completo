// src/pages/OrderConfirmation.tsx
import { useParams, useLocation, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, MessageCircle, ShoppingBag, MapPin, Truck } from "lucide-react";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '';

const PAYMENT_LABELS: Record<string, string> = {
  PIX: 'PIX',
  CARTAO_CREDITO: 'Cartão de Crédito',
  CARTAO_DEBITO: 'Cartão de Débito',
  DINHEIRO: 'Dinheiro',
};

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { state } = useLocation();

  const order = state?.order;
  const cartSnapshot: { id: string; name: string; price: number; quantity: number }[] = state?.cartSnapshot ?? [];
  const deliveryMethod: 'delivery' | 'pickup' | undefined = state?.deliveryMethod;
  const paymentMethod: string | undefined = state?.paymentMethod;
  const clienteNome: string = state?.clienteNome ?? '';
  const clienteTelefone: string = state?.clienteTelefone ?? '';
  const cupom: string | null = state?.cupom ?? null;
  const addressInfo: string = state?.addressInfo ?? '';

  const pedidoNumero = orderId?.substring(0, 8).toUpperCase() ?? '---';
  const total = order ? Number(order.valor_total) : 0;
  const desconto = order ? Number(order.desconto ?? 0) : 0;

  const buildWhatsAppMessage = () => {
    const lines: string[] = [];

    lines.push(`🛍️ *Novo Pedido - Luar Cosméticos*`);
    lines.push(`📋 Pedido: *#${pedidoNumero}*`);
    lines.push('');

    if (clienteNome) lines.push(`👤 *Cliente:* ${clienteNome}`);
    if (clienteTelefone) lines.push(`📞 *Telefone:* ${clienteTelefone}`);
    if (clienteNome || clienteTelefone) lines.push('');

    lines.push(`📦 *Itens do Pedido:*`);
    cartSnapshot.forEach(item => {
      lines.push(`• ${item.name} (${item.quantity}x) — ${fmt(item.price * item.quantity)}`);
    });
    lines.push('');

    if (deliveryMethod === 'pickup') {
      lines.push(`📍 *Retirada na Loja*`);
      if (addressInfo) lines.push(addressInfo);
    } else {
      lines.push(`🚚 *Entrega em Casa*`);
      if (addressInfo) lines.push(addressInfo);
    }
    lines.push('');

    if (paymentMethod) {
      lines.push(`💳 *Forma de Pagamento:* ${PAYMENT_LABELS[paymentMethod] ?? paymentMethod}`);
      lines.push('');
    }

    if (desconto > 0 && cupom) {
      lines.push(`🏷️ *Cupom:* ${cupom} (−${fmt(desconto)})`);
    }

    lines.push(`💰 *Total: ${fmt(total)}*`);

    return lines.join('\n');
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(buildWhatsAppMessage());
    const url = WHATSAPP_NUMBER
      ? `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`
      : `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-xl mx-auto space-y-5">

            {/* Cabeçalho de sucesso */}
            <Card>
              <CardContent className="pt-10 pb-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-11 w-11 text-green-600" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold mb-2">Pedido registrado!</h1>
                <p className="text-muted-foreground text-sm mb-5">
                  Clique no botão abaixo para enviar seu pedido via WhatsApp e finalizar a compra.
                </p>

                <div className="bg-muted rounded-lg px-4 py-3 inline-block mb-6">
                  <p className="text-xs text-muted-foreground">Nº do Pedido</p>
                  <p className="text-xl font-bold text-primary">#{pedidoNumero}</p>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white gap-2 text-base py-6"
                  onClick={handleWhatsApp}
                >
                  <MessageCircle className="h-5 w-5" />
                  Enviar pedido pelo WhatsApp
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  O WhatsApp abrirá com o seu pedido já formatado.
                </p>
              </CardContent>
            </Card>

            {/* Resumo do pedido */}
            {cartSnapshot.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="space-y-2">
                    {cartSnapshot.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.name}{' '}
                          <span className="font-medium text-foreground">x{item.quantity}</span>
                        </span>
                        <span className="font-medium">{fmt(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {desconto > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>Desconto {cupom && `(${cupom})`}</span>
                      <span>−{fmt(desconto)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>{fmt(total)}</span>
                  </div>

                  <Separator />

                  <div className="space-y-1 text-sm text-muted-foreground">
                    {deliveryMethod && (
                      <div className="flex items-start gap-2">
                        {deliveryMethod === 'pickup'
                          ? <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          : <Truck className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        <span>
                          {deliveryMethod === 'pickup' ? 'Retirada' : 'Entrega'}
                          {addressInfo && ` — ${addressInfo}`}
                        </span>
                      </div>
                    )}
                    {paymentMethod && (
                      <p>💳 {PAYMENT_LABELS[paymentMethod] ?? paymentMethod}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-center">
              <Button variant="outline" asChild className="gap-2">
                <Link to="/catalog">
                  <ShoppingBag className="h-4 w-4" />
                  Continuar Comprando
                </Link>
              </Button>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;

// src/pages/Cart.tsx
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { BACKEND_URL } from "@/services/apiService";

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  const subtotal = cartItems.reduce((sum, item) => {
    const price = Number(item.price || 0);
    const qtd = Number(item.quantity || 1);
    return sum + (price * qtd);
  }, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 animate-fade-in">
            Carrinho de Compras
          </h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <ShoppingBag className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-4">Seu carrinho está vazio</h2>
              <p className="text-muted-foreground mb-8">
                Adicione produtos para começar suas compras
              </p>
              <Button size="lg" asChild>
                <Link to="/catalog">Explorar Produtos</Link>
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Lista de Itens */}
              <div className="lg:col-span-2 space-y-4 animate-fade-in">
                {cartItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <img
                          src={item.image ? `${BACKEND_URL}/${item.image}` : `https://via.placeholder.com/96x96.png?text=Foto`}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-md"
                          onError={(e) => {
                            // Fallback se a imagem quebrar
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/96x96.png?text=Erro";
                          }}
                        />
                        
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{item.name}</h3>
                          
                          {/* PROTEÇÃO 2: Corrige o erro do toFixed */}
                          <p className="text-lg font-bold text-primary mb-4">
                            R$ {Number(item.price || 0).toFixed(2)}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center font-semibold">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Resumo do Pedido */}
              <div className="animate-fade-in">
                <Card className="sticky top-24">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-6">Resumo do Pedido</h2>
                    
                    <Separator className="my-6" />
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-semibold">R$ {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Frete</span>
                        <span className="text-sm text-muted-foreground italic">A combinar via WhatsApp</span>
                      </div>
                    </div>
                    <Separator className="my-6" />
                    <div className="flex justify-between mb-6">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-2xl font-bold text-primary">R$ {subtotal.toFixed(2)}</span>
                    </div>
                    <Button className="w-full mb-3" size="lg" asChild>
                      <Link to="/checkout">Finalizar Compra</Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/catalog">Continuar Comprando</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
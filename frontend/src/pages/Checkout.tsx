// src/pages/Checkout.tsx

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getProfile, getAddresses, placeOrder, validateCupom } from "@/services/apiService";
import { Store, Truck, MapPin, Loader2, Tag, X } from "lucide-react";
import { useViaCEP } from "@/hooks/useViaCEP";
import {
  maskPhone,
  maskCEP,
  maskEstado,
  validateCheckoutAddress,
  type CheckoutGuestErrors,
  type CheckoutAddressErrors,
} from "@/lib/validators";

// --- CONFIGURAÇÃO DAS LOJAS (PONTOS DE RETIRADA) ---
const pickupLocations = [
  {
    id: 'store-1',
    name: 'Loja 1 (Aldeia)',
    rua: 'Av. Vera Cruz',
    numero: '56',
    complemento: 'Aldeia km 10, Galeria Skabeté',
    bairro: 'Aldeia',
    cidade: 'Camaragibe',
    estado: 'PE',
    cep: '54759-000',
  },
  {
    id: 'store-2',
    name: 'Loja 2 (Camaragibe Centro)',
    rua: 'Rua Eliza Cabral',
    numero: '142',
    complemento: 'Galeria Bom Jesus',
    bairro: 'Centro',
    cidade: 'Camaragibe',
    estado: 'PE',
    cep: '54762-000',
  },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, token, login } = useAuth();
  const { cartItems, clearCart } = useCart();

  // Snapshot do pedido para passar à tela de confirmação
  const pendingOrderState = useRef<any>(null);

  // Estados de controle
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedStoreId, setSelectedStoreId] = useState<string>(pickupLocations[0].id);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('PIX');

  // Campos controlados (convidado)
  const [telefoneValue, setTelefoneValue] = useState('');
  const [senhaValue, setSenhaValue] = useState('');
  const [confirmarSenhaValue, setConfirmarSenhaValue] = useState('');

  // Campos controlados com máscara (endereço)
  const [cepValue, setCepValue] = useState('');
  const [estadoValue, setEstadoValue] = useState('');
  const [ruaValue, setRuaValue] = useState('');
  const [bairroValue, setBairroValue] = useState('');
  const [cidadeValue, setCidadeValue] = useState('');

  const { isLoadingCEP, cepNotFound, fetchAddressByCEP, resetCEPState } = useViaCEP();

  // Cupom
  const [cupomInput, setCupomInput] = useState('');
  const [appliedCupom, setAppliedCupom] = useState<{ codigo: string; desconto: number } | null>(null);

  // Erros de validação
  const [guestErrors, setGuestErrors] = useState<CheckoutGuestErrors>({});
  const [addressErrors, setAddressErrors] = useState<CheckoutAddressErrors>({});

  const showNewAddressForm = deliveryMethod === 'delivery' && (!isAuthenticated || selectedAddressId === 'new');

  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: () => getProfile(token!), enabled: isAuthenticated });
  const { data: addresses } = useQuery({ queryKey: ['addresses'], queryFn: () => getAddresses(token!), enabled: isAuthenticated });

  useEffect(() => {
    if (isAuthenticated && addresses) {
      if (addresses.length > 0) {
        if (!selectedAddressId) {
          const principal = addresses.find((a: any) => a.principal);
          setSelectedAddressId(principal ? principal.id : addresses[0].id);
        }
      } else {
        setSelectedAddressId('new');
      }
    } else if (!isAuthenticated) {
      setSelectedAddressId('new');
    }
  }, [addresses, isAuthenticated, selectedAddressId]);

  // Limpa erros e campos de endereço ao trocar método
  useEffect(() => {
    setAddressErrors({});
    setGuestErrors({});
    setCepValue('');
    setEstadoValue('');
    setRuaValue('');
    setBairroValue('');
    setCidadeValue('');
    resetCEPState();
  }, [deliveryMethod]);

  // Busca endereço via ViaCEP quando CEP atinge 8 dígitos
  const handleCEPChange = useCallback(async (maskedCep: string) => {
    setCepValue(maskedCep);
    const digits = maskedCep.replace(/\D/g, '');
    if (digits.length === 8) {
      const address = await fetchAddressByCEP(maskedCep);
      if (address) {
        setRuaValue(address.rua);
        setBairroValue(address.bairro);
        setCidadeValue(address.cidade);
        setEstadoValue(address.estado);
      }
    }
  }, [fetchAddressByCEP]);

  const cupomMutation = useMutation({
    mutationFn: () => validateCupom(cupomInput, subtotal),
    onSuccess: (data) => {
      setAppliedCupom({ codigo: data.cupom.codigo, desconto: data.desconto });
      toast({ title: `Cupom aplicado! Desconto de R$ ${data.desconto.toFixed(2)}` });
    },
    onError: (error: Error) => toast({ title: 'Cupom inválido', description: error.message, variant: 'destructive' }),
  });

  const checkoutMutation = useMutation({
    mutationFn: (checkoutData: any) => placeOrder(checkoutData, token),
    onSuccess: (data) => {
      toast({ title: "Pedido realizado com sucesso!" });
      // Auto-login se o backend criou uma conta no checkout
      if (data.token) login(data.token);
      navigate(`/order-confirmation/${data.id}`, {
        state: { order: data, ...pendingOrderState.current },
      });
      clearCart();
    },
    onError: (error: Error) =>
      toast({ title: "Erro no pedido", description: error.message, variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const formProps = Object.fromEntries(formData.entries()) as Record<string, string>;

    let addressData: any;
    let hasErrors = false;

    // ─── RETIRADA NA LOJA ───────────────────────────────
    if (deliveryMethod === 'pickup') {
      const store = pickupLocations.find(s => s.id === selectedStoreId);
      if (!store) return;
      addressData = {
        rua: store.rua,
        numero: store.numero,
        complemento: `${store.complemento} (RETIRADA NA LOJA: ${store.name})`,
        bairro: store.bairro,
        cidade: store.cidade,
        estado: store.estado,
        cep: store.cep,
      };
    }
    // ─── ENTREGA EM CASA ────────────────────────────────
    else {
      if (isAuthenticated) {
        if (!selectedAddressId) {
          toast({ title: "Erro", description: "Selecione ou adicione um endereço de entrega.", variant: "destructive" });
          return;
        }
        if (selectedAddressId === 'new') {
          const addrFields = {
            cep: cepValue,
            rua: formProps.rua || '',
            numero: formProps.numero || '',
            bairro: formProps.bairro || '',
            cidade: formProps.cidade || '',
            estado: estadoValue,
          };
          const addrErrs = validateCheckoutAddress(addrFields);
          if (Object.keys(addrErrs).length > 0) {
            setAddressErrors(addrErrs);
            hasErrors = true;
          } else {
            setAddressErrors({});
            addressData = { ...addrFields, complemento: formProps.complemento || '' };
          }
        } else {
          const saved = addresses?.find((a: any) => a.id === selectedAddressId);
          if (!saved) {
            toast({ title: "Erro", description: "Endereço selecionado inválido.", variant: "destructive" });
            return;
          }
          addressData = saved;
        }
      } else {
        // Convidado: endereço vem do formulário
        const addrFields = {
          cep: cepValue,
          rua: formProps.rua || '',
          numero: formProps.numero || '',
          bairro: formProps.bairro || '',
          cidade: formProps.cidade || '',
          estado: estadoValue,
        };
        const addrErrs = validateCheckoutAddress(addrFields);
        if (Object.keys(addrErrs).length > 0) {
          setAddressErrors(addrErrs);
          hasErrors = true;
        } else {
          setAddressErrors({});
          addressData = { ...addrFields, complemento: formProps.complemento || '' };
        }
      }
    }

    // ─── DADOS PESSOAIS (CONVIDADO) ─────────────────────
    if (!isAuthenticated) {
      const nome = formProps.nome || '';
      const email = formProps.email || '';

      const newGuestErrors: CheckoutGuestErrors = {};
      if (nome.trim().length < 2) newGuestErrors.nome = 'Nome precisa ter ao menos 2 caracteres.';
      if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newGuestErrors.email = 'E-mail inválido.';
      if (!telefoneValue || telefoneValue.replace(/\D/g, '').length < 10)
        newGuestErrors.telefone = 'Telefone inválido.';
      if (senhaValue.length < 6) newGuestErrors.senha = 'A senha precisa ter ao menos 6 caracteres.';
      if (senhaValue !== confirmarSenhaValue) newGuestErrors.confirmarSenha = 'As senhas não coincidem.';

      if (Object.keys(newGuestErrors).length > 0) {
        setGuestErrors(newGuestErrors);
        hasErrors = true;
      } else {
        setGuestErrors({});
        if (addressData) {
          addressData = { ...addressData, nome, email, telefone: telefoneValue, senha: senhaValue };
        }
      }
    }

    if (hasErrors) return;

    const checkoutData = {
      cartItems: cartItems.map(item => ({ id: item.id, quantity: item.quantity })),
      address: addressData,
      isPickup: deliveryMethod === 'pickup',
      cupomCodigo: appliedCupom?.codigo || null,
      paymentMethod,
    };

    // Monta o endereço para exibir na confirmação
    let addressInfo = '';
    if (deliveryMethod === 'pickup') {
      const store = pickupLocations.find(s => s.id === selectedStoreId);
      addressInfo = store ? store.name : '';
    } else if (addressData) {
      addressInfo = `${addressData.rua}, ${addressData.numero}${addressData.complemento ? ' - ' + addressData.complemento : ''} — ${addressData.bairro}, ${addressData.cidade}/${addressData.estado}`;
    }

    pendingOrderState.current = {
      cartSnapshot: cartItems.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
      deliveryMethod,
      paymentMethod,
      addressInfo,
      clienteNome: isAuthenticated ? `${profile?.nome ?? ''} ${profile?.sobrenome ?? ''}`.trim() : formProps.nome || '',
      clienteTelefone: isAuthenticated ? profile?.telefone || '' : telefoneValue,
      cupom: appliedCupom?.codigo || null,
    };

    checkoutMutation.mutate(checkoutData);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const frete = 0;
  const desconto = appliedCupom?.desconto ?? 0;
  const total = subtotal + frete - desconto;

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 animate-fade-in">Finalizar Compra</h1>

          {!isAuthenticated && (
            <Card className="mb-6 bg-accent/10 border-accent animate-fade-in">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-center sm:text-left">
                  <span className="font-semibold">Já tem uma conta?</span> Faça login para usar seus endereços salvos.
                </p>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" asChild><Link to="/login">Login</Link></Button>
                </div>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6 animate-fade-in">

                {/* ─── DADOS DO CLIENTE ─────────────────────────────── */}
                {isAuthenticated ? (
                  <Card>
                    <CardHeader><CardTitle>Dados do Cliente</CardTitle></CardHeader>
                    <CardContent>
                      <p className="font-medium text-lg">{profile?.nome} {profile?.sobrenome}</p>
                      <p className="text-muted-foreground">{profile?.email}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Criar sua conta</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Seus dados ficam salvos para facilitar os próximos pedidos.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nome">Nome *</Label>
                          <Input
                            id="nome" name="nome" required
                            placeholder="Seu nome"
                            className={guestErrors.nome ? 'border-red-500' : ''}
                          />
                          {guestErrors.nome && <p className="text-xs text-red-500 mt-1">{guestErrors.nome}</p>}
                        </div>
                        <div>
                          <Label htmlFor="telefone">WhatsApp *</Label>
                          <Input
                            id="telefone" name="telefone"
                            value={telefoneValue}
                            onChange={(e) => setTelefoneValue(maskPhone(e.target.value))}
                            placeholder="(00) 00000-0000"
                            className={guestErrors.telefone ? 'border-red-500' : ''}
                          />
                          {guestErrors.telefone && <p className="text-xs text-red-500 mt-1">{guestErrors.telefone}</p>}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">E-mail *</Label>
                        <Input
                          id="email" name="email" type="email" required
                          placeholder="seu@email.com"
                          className={guestErrors.email ? 'border-red-500' : ''}
                        />
                        {guestErrors.email && <p className="text-xs text-red-500 mt-1">{guestErrors.email}</p>}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="senha">Senha *</Label>
                          <Input
                            id="senha" name="senha" type="password"
                            value={senhaValue}
                            onChange={(e) => setSenhaValue(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            className={guestErrors.senha ? 'border-red-500' : ''}
                          />
                          {guestErrors.senha && <p className="text-xs text-red-500 mt-1">{guestErrors.senha}</p>}
                        </div>
                        <div>
                          <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                          <Input
                            id="confirmarSenha" name="confirmarSenha" type="password"
                            value={confirmarSenhaValue}
                            onChange={(e) => setConfirmarSenhaValue(e.target.value)}
                            placeholder="Repita a senha"
                            className={guestErrors.confirmarSenha ? 'border-red-500' : ''}
                          />
                          {guestErrors.confirmarSenha && <p className="text-xs text-red-500 mt-1">{guestErrors.confirmarSenha}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ─── OPÇÕES DE ENTREGA ──────────────────────────────── */}
                <Card>
                  <CardHeader><CardTitle>Opções de Entrega</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        onClick={() => setDeliveryMethod('delivery')}
                        className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all ${deliveryMethod === 'delivery' ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'hover:bg-accent/50'}`}
                      >
                        <Truck className={`h-8 w-8 ${deliveryMethod === 'delivery' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`font-semibold ${deliveryMethod === 'delivery' ? 'text-primary' : 'text-muted-foreground'}`}>Entrega em Casa</span>
                      </div>
                      <div
                        onClick={() => setDeliveryMethod('pickup')}
                        className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-all ${deliveryMethod === 'pickup' ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'hover:bg-accent/50'}`}
                      >
                        <Store className={`h-8 w-8 ${deliveryMethod === 'pickup' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`font-semibold ${deliveryMethod === 'pickup' ? 'text-primary' : 'text-muted-foreground'}`}>Retirada na Loja</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ─── RETIRADA NA LOJA ───────────────────────────────── */}
                {deliveryMethod === 'pickup' && (
                  <Card className="border-primary/50 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-primary">
                        <MapPin className="h-5 w-5" /> Selecione o Ponto de Retirada
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup value={selectedStoreId} onValueChange={setSelectedStoreId} className="space-y-3">
                        {pickupLocations.map(store => (
                          <div key={store.id} className={`flex items-start space-x-3 border p-4 rounded-lg bg-white ${selectedStoreId === store.id ? 'border-primary ring-1 ring-primary' : ''}`}>
                            <RadioGroupItem value={store.id} id={store.id} className="mt-1" />
                            <div className="flex-1">
                              <Label htmlFor={store.id} className="font-bold text-base cursor-pointer block mb-1">
                                {store.name} <Badge variant="secondary" className="ml-2 text-xs">Grátis</Badge>
                              </Label>
                              <p className="text-sm text-muted-foreground">{store.rua}, {store.numero} - {store.bairro}</p>
                              <p className="text-sm text-muted-foreground">{store.complemento}</p>
                              <p className="text-sm text-muted-foreground">{store.cidade} - {store.estado}</p>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                      <p className="text-sm text-muted-foreground mt-4 italic">
                        * Você receberá um aviso quando o pedido estiver pronto para retirada.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* ─── ENDEREÇO DE ENTREGA ────────────────────────────── */}
                {deliveryMethod === 'delivery' && (
                  <Card>
                    <CardHeader><CardTitle>Endereço de Entrega</CardTitle></CardHeader>
                    <CardContent>
                      {isAuthenticated && addresses && addresses.length > 0 && (
                        <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId} className="mb-4 space-y-2">
                          {addresses.map((addr: any) => (
                            <div key={addr.id} className={`flex items-center space-x-2 border p-3 rounded hover:bg-accent/5 ${addr.principal ? 'border-primary bg-primary/5' : ''}`}>
                              <RadioGroupItem value={addr.id} id={addr.id} />
                              <Label htmlFor={addr.id} className="font-normal cursor-pointer flex-1">
                                <span className="font-medium">{addr.rua}, {addr.numero}</span> - {addr.bairro}, {addr.cidade}
                                {addr.principal && <Badge variant="secondary" className="ml-2 text-xs">Principal</Badge>}
                              </Label>
                            </div>
                          ))}
                          <div className="flex items-center space-x-2 border p-3 rounded hover:bg-accent/5">
                            <RadioGroupItem value="new" id="new" />
                            <Label htmlFor="new" className="font-normal cursor-pointer">Adicionar novo endereço</Label>
                          </div>
                        </RadioGroup>
                      )}

                      {showNewAddressForm && (
                        <div className="space-y-4 pt-4 border-t">
                          {/* CEP */}
                          <div className="grid sm:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="cep">CEP *</Label>
                              <div className="relative">
                                <Input
                                  id="cep" name="cep"
                                  value={cepValue}
                                  onChange={(e) => handleCEPChange(maskCEP(e.target.value))}
                                  placeholder="00000-000"
                                  className={addressErrors.cep ? "border-red-500" : ""}
                                />
                                {isLoadingCEP && (
                                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                                )}
                              </div>
                              {cepNotFound && <p className="text-xs text-red-500 mt-1">CEP não encontrado.</p>}
                              {addressErrors.cep && <p className="text-xs text-red-500 mt-1">{addressErrors.cep}</p>}
                            </div>
                          </div>

                          {/* Rua */}
                          <div>
                            <Label htmlFor="rua">Rua *</Label>
                            <Input
                              id="rua" name="rua" required
                              value={ruaValue}
                              onChange={(e) => setRuaValue(e.target.value)}
                              className={addressErrors.rua ? "border-red-500" : ""}
                            />
                            {addressErrors.rua && <p className="text-xs text-red-500 mt-1">{addressErrors.rua}</p>}
                          </div>

                          {/* Número + Complemento */}
                          <div className="grid sm:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="numero">Número *</Label>
                              <Input
                                id="numero" name="numero" required
                                className={addressErrors.numero ? "border-red-500" : ""}
                              />
                              {addressErrors.numero && <p className="text-xs text-red-500 mt-1">{addressErrors.numero}</p>}
                            </div>
                            <div className="sm:col-span-2">
                              <Label htmlFor="complemento">Complemento</Label>
                              <Input id="complemento" name="complemento" />
                            </div>
                          </div>

                          {/* Bairro + Cidade + Estado */}
                          <div className="grid sm:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="bairro">Bairro *</Label>
                              <Input
                                id="bairro" name="bairro" required
                                value={bairroValue}
                                onChange={(e) => setBairroValue(e.target.value)}
                                className={addressErrors.bairro ? "border-red-500" : ""}
                              />
                              {addressErrors.bairro && <p className="text-xs text-red-500 mt-1">{addressErrors.bairro}</p>}
                            </div>
                            <div>
                              <Label htmlFor="cidade">Cidade *</Label>
                              <Input
                                id="cidade" name="cidade" required
                                value={cidadeValue}
                                onChange={(e) => setCidadeValue(e.target.value)}
                                className={addressErrors.cidade ? "border-red-500" : ""}
                              />
                              {addressErrors.cidade && <p className="text-xs text-red-500 mt-1">{addressErrors.cidade}</p>}
                            </div>
                            <div>
                              <Label htmlFor="estado">Estado *</Label>
                              <Input
                                id="estado" name="estado"
                                value={estadoValue}
                                onChange={(e) => setEstadoValue(maskEstado(e.target.value))}
                                placeholder="PE"
                                maxLength={2}
                                className={addressErrors.estado ? "border-red-500" : ""}
                              />
                              {addressErrors.estado && <p className="text-xs text-red-500 mt-1">{addressErrors.estado}</p>}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader><CardTitle>Forma de Pagamento</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'PIX', label: 'PIX', emoji: '💰' },
                        { value: 'CARTAO_CREDITO', label: 'Cartão de Crédito', emoji: '💳' },
                        { value: 'CARTAO_DEBITO', label: 'Cartão de Débito', emoji: '💳' },
                        { value: 'DINHEIRO', label: 'Dinheiro', emoji: '💵' },
                      ].map(opt => (
                        <div
                          key={opt.value}
                          onClick={() => setPaymentMethod(opt.value)}
                          className={`cursor-pointer border rounded-lg p-3 flex items-center gap-2 transition-all text-sm ${paymentMethod === opt.value ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'hover:bg-accent/50'}`}
                        >
                          <span className="text-lg">{opt.emoji}</span>
                          <span className={`font-medium ${paymentMethod === opt.value ? 'text-primary' : 'text-muted-foreground'}`}>{opt.label}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      O pagamento será confirmado diretamente pelo WhatsApp.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* ─── RESUMO DO PEDIDO ────────────────────────────────── */}
              <div className="animate-fade-in">
                <Card className="sticky top-24">
                  <CardHeader><CardTitle>Resumo do Pedido</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {cartItems.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.name} x {item.quantity}</span>
                          <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <Separator />

                    {/* Cupom */}
                    {appliedCupom ? (
                      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm">
                        <div className="flex items-center gap-2 text-green-700">
                          <Tag className="h-4 w-4" />
                          <span className="font-mono font-semibold">{appliedCupom.codigo}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setAppliedCupom(null); setCupomInput(''); }}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Código do cupom"
                          value={cupomInput}
                          onChange={(e) => setCupomInput(e.target.value.toUpperCase())}
                          className="font-mono text-sm h-9"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-9 flex-shrink-0"
                          disabled={!cupomInput.trim() || cupomMutation.isPending}
                          onClick={() => cupomMutation.mutate()}
                        >
                          {cupomMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aplicar'}
                        </Button>
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>R$ {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Frete</span>
                        {deliveryMethod === 'pickup' ? (
                          <span className="text-green-600 font-medium">Grátis (Retirada)</span>
                        ) : (
                          <span>R$ {frete.toFixed(2)}</span>
                        )}
                      </div>
                      {desconto > 0 && (
                        <div className="flex justify-between text-sm text-green-600 font-medium">
                          <span>Desconto</span>
                          <span>- R$ {desconto.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>R$ {total.toFixed(2)}</span>
                    </div>
                    <Button
                      type="submit"
                      className="w-full" size="lg"
                      disabled={checkoutMutation.isPending || cartItems.length === 0}
                    >
                      {checkoutMutation.isPending ? 'Processando...' : 'Finalizar Pedido'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Checkout;

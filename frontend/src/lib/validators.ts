// ─────────────────────────────────────────────
// MÁSCARAS DE FORMATAÇÃO
// ─────────────────────────────────────────────

/** Formata CPF: 000.000.000-00 */
export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/** Formata telefone: (00) 00000-0000 ou (00) 0000-0000 */
export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Formata CEP: 00000-000 */
export function maskCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

/** Formata estado: 2 letras maiúsculas */
export function maskEstado(value: string): string {
  return value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 2);
}

// ─────────────────────────────────────────────
// VALIDAÇÕES
// ─────────────────────────────────────────────

/** Valida CPF com cálculo de dígitos verificadores */
export function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let rem = sum % 11;
  const d1 = rem < 2 ? 0 : 11 - rem;
  if (d1 !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  rem = sum % 11;
  const d2 = rem < 2 ? 0 : 11 - rem;
  return d2 === parseInt(digits[10]);
}

/** Valida telefone: 10 ou 11 dígitos */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11;
}

/** Valida CEP: 8 dígitos */
export function isValidCEP(cep: string): boolean {
  return cep.replace(/\D/g, '').length === 8;
}

/** Valida estado: 2 letras */
export function isValidEstado(estado: string): boolean {
  return /^[A-Za-z]{2}$/.test(estado.trim());
}

// ─────────────────────────────────────────────
// VALIDAÇÃO COMPLETA DO FORMULÁRIO DE CADASTRO
// ─────────────────────────────────────────────

export interface RegisterErrors {
  name?: string;
  sobrenome?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  cpf?: string;
  telefone?: string;
}

export function validateRegisterForm(data: {
  name: string;
  sobrenome: string;
  email: string;
  password: string;
  confirmPassword: string;
  cpf: string;
  telefone: string;
}): RegisterErrors {
  const errors: RegisterErrors = {};

  if (!data.name.trim() || data.name.trim().length < 2)
    errors.name = 'O nome precisa ter no mínimo 2 caracteres.';

  if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = 'Informe um e-mail válido.';

  if (!data.password || data.password.length < 6)
    errors.password = 'A senha precisa ter no mínimo 6 caracteres.';

  if (data.password !== data.confirmPassword)
    errors.confirmPassword = 'As senhas não coincidem.';

  if (data.cpf && !isValidCPF(data.cpf))
    errors.cpf = 'CPF inválido. Verifique os dígitos.';

  if (data.telefone && !isValidPhone(data.telefone))
    errors.telefone = 'Telefone inválido. Informe DDD + número.';

  return errors;
}

// ─────────────────────────────────────────────
// VALIDAÇÃO DO FORMULÁRIO DE CHECKOUT (CONVIDADO)
// ─────────────────────────────────────────────

export interface CheckoutGuestErrors {
  nome?: string;
  email?: string;
  telefone?: string;
  senha?: string;
  confirmarSenha?: string;
}

export interface CheckoutAddressErrors {
  cep?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

export function validateCheckoutGuest(data: {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
}): CheckoutGuestErrors {
  const errors: CheckoutGuestErrors = {};

  if (!data.nome.trim()) errors.nome = 'Nome é obrigatório.';

  if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = 'Informe um e-mail válido.';

  if (!data.telefone.trim()) {
    errors.telefone = 'Telefone é obrigatório.';
  } else if (!isValidPhone(data.telefone)) {
    errors.telefone = 'Telefone inválido. Informe DDD + número.';
  }

  if (!data.cpf.trim()) {
    errors.cpf = 'CPF é obrigatório.';
  } else if (!isValidCPF(data.cpf)) {
    errors.cpf = 'CPF inválido. Verifique os dígitos.';
  }

  return errors;
}

export function validateCheckoutAddress(data: {
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
}): CheckoutAddressErrors {
  const errors: CheckoutAddressErrors = {};

  if (!data.cep.trim()) {
    errors.cep = 'CEP é obrigatório.';
  } else if (!isValidCEP(data.cep)) {
    errors.cep = 'CEP inválido. Informe 8 dígitos.';
  }

  if (!data.rua.trim()) errors.rua = 'Rua é obrigatória.';
  if (!data.numero.trim()) errors.numero = 'Número é obrigatório.';
  if (!data.bairro.trim()) errors.bairro = 'Bairro é obrigatório.';
  if (!data.cidade.trim()) errors.cidade = 'Cidade é obrigatória.';

  if (!data.estado.trim()) {
    errors.estado = 'Estado é obrigatório.';
  } else if (!isValidEstado(data.estado)) {
    errors.estado = 'Use 2 letras (ex: PE, SP).';
  }

  return errors;
}

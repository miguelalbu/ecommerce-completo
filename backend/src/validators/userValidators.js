const { z } = require('zod');

// ─────────────────────────────────────────────
// HELPERS DE VALIDAÇÃO BRASILEIRA
// ─────────────────────────────────────────────

function validateCPF(cpf) {
  const digits = String(cpf).replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false; // Todos iguais (ex: 11111111111)

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

function validatePhone(phone) {
  const digits = String(phone).replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11;
}

function validateCEP(cep) {
  const digits = String(cep).replace(/\D/g, '');
  return digits.length === 8;
}

// ─────────────────────────────────────────────
// SCHEMAS ADMIN
// ─────────────────────────────────────────────

const createUserSchema = z.object({
  name: z.string().min(3, { message: 'O nome precisa ter no mínimo 3 caracteres.' }),
  email: z.string().email({ message: 'Formato de e-mail inválido.' }),
  password: z.string().min(6, { message: 'A senha precisa ter no mínimo 6 caracteres.' }),
  funcao: z.enum(['ADMIN_GLOBAL', 'GERENTE', 'VENDEDOR'], {
    message: 'Cargo inválido. Use: ADMIN_GLOBAL, GERENTE ou VENDEDOR.',
  }).default('VENDEDOR'),
});

const loginUserSchema = z.object({
  email: z.string().email({ message: 'Formato de e-mail inválido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

// ─────────────────────────────────────────────
// SCHEMAS CLIENTES
// ─────────────────────────────────────────────

const registerCustomerSchema = z.object({
  name: z.string().min(2, { message: 'O nome precisa ter no mínimo 2 caracteres.' }),
  sobrenome: z.string().optional().nullable(),
  email: z.string().email({ message: 'Formato de e-mail inválido.' }),
  password: z.string().min(6, { message: 'A senha precisa ter no mínimo 6 caracteres.' }),
  cpf: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || validateCPF(val), {
      message: 'CPF inválido. Verifique os dígitos.',
    }),
  telefone: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || validatePhone(val), {
      message: 'Telefone inválido. Informe DDD + número (10 ou 11 dígitos).',
    }),
  dataNascimento: z.string().optional().nullable(),
  genero: z.enum(['MASCULINO', 'FEMININO', 'OUTRO']).optional().nullable(),
});

const loginCustomerSchema = z.object({
  email: z.string().email({ message: 'Formato de e-mail inválido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

// ─────────────────────────────────────────────
// SCHEMA DE ENDEREÇO (rota POST /addresses)
// ─────────────────────────────────────────────

const addressSchema = z.object({
  rua: z.string().min(1, { message: 'A rua é obrigatória.' }),
  numero: z.string().min(1, { message: 'O número é obrigatório.' }),
  complemento: z.string().optional().nullable(),
  bairro: z.string().min(1, { message: 'O bairro é obrigatório.' }),
  cidade: z.string().min(1, { message: 'A cidade é obrigatória.' }),
  estado: z
    .string()
    .length(2, { message: 'O estado deve ter 2 letras (ex: PE, SP).' })
    .regex(/^[A-Za-z]{2}$/, { message: 'Estado inválido.' }),
  cep: z.string().refine(validateCEP, { message: 'CEP inválido. Informe 8 dígitos.' }),
});

// ─────────────────────────────────────────────
// SCHEMA DO CHECKOUT
// ─────────────────────────────────────────────

const cartItemSchema = z.object({
  id: z.string().min(1, { message: 'ID do produto inválido.' }),
  quantity: z
    .number({ message: 'Quantidade deve ser um número.' })
    .int({ message: 'Quantidade deve ser um número inteiro.' })
    .min(1, { message: 'Quantidade mínima é 1.' }),
});

const checkoutAddressSchema = z.object({
  // ID presente quando é endereço salvo
  id: z.string().optional(),

  // Campos de endereço
  rua: z.string().min(1, { message: 'A rua é obrigatória.' }),
  numero: z.string().min(1, { message: 'O número é obrigatório.' }),
  complemento: z.string().optional().nullable(),
  bairro: z.string().min(1, { message: 'O bairro é obrigatório.' }),
  cidade: z.string().min(1, { message: 'A cidade é obrigatória.' }),
  estado: z
    .string()
    .length(2, { message: 'O estado deve ter 2 letras (ex: PE, SP).' })
    .regex(/^[A-Za-z]{2}$/, { message: 'Estado inválido.' }),
  cep: z.string().refine(validateCEP, { message: 'CEP inválido. Informe 8 dígitos.' }),

  // Dados pessoais — opcionais (preenchidos apenas quando convidado)
  nome: z.string().optional(),
  sobrenome: z.string().optional(),
  email: z
    .string()
    .email({ message: 'E-mail inválido.' })
    .optional()
    .or(z.literal('')),
  telefone: z
    .string()
    .optional()
    .refine((val) => !val || validatePhone(val), {
      message: 'Telefone inválido. Informe DDD + número.',
    }),
  cpf: z
    .string()
    .optional()
    .refine((val) => !val || validateCPF(val), { message: 'CPF inválido.' }),
});

const checkoutSchema = z.object({
  cartItems: z
    .array(cartItemSchema)
    .min(1, { message: 'O carrinho não pode estar vazio.' }),
  isPickup: z.boolean({ message: 'Tipo de entrega inválido.' }),
  address: checkoutAddressSchema,
});

// ─────────────────────────────────────────────
// SCHEMA DE ATUALIZAÇÃO DE PERFIL
// ─────────────────────────────────────────────

const updateProfileSchema = z.object({
  nome: z.string().min(2, { message: 'O nome precisa ter no mínimo 2 caracteres.' }).optional(),
  sobrenome: z.string().optional().nullable(),
  email: z.string().email({ message: 'Formato de e-mail inválido.' }).optional(),
  cpf: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || validateCPF(val), {
      message: 'CPF inválido. Verifique os dígitos.',
    }),
  telefone: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || validatePhone(val), {
      message: 'Telefone inválido. Informe DDD + número (10 ou 11 dígitos).',
    }),
});

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────

module.exports = {
  createUserSchema,
  loginUserSchema,
  registerCustomerSchema,
  loginCustomerSchema,
  addressSchema,
  checkoutSchema,
  updateProfileSchema,
};

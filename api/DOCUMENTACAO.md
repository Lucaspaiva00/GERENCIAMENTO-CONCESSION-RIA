# Documentação da API — Gerenciamento de Concessionária

API REST para gerenciamento de concessionária (multi-loja): estoque, vendas, financeiro, comissões e geração de PDFs.

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| Linguagem | TypeScript 5 |
| Runtime | Node.js + Express 4 |
| ORM | Prisma 6 + MySQL |
| Auth | JWT (`jsonwebtoken`) + bcrypt |
| Upload | Multer (disco) |
| PDF | PDFKit |
| Env | `dotenv` — `PORT`, `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET` |

**Scripts:**
- `npm run dev` — `tsx watch` (hot reload em desenvolvimento)
- `npm run build` — `prisma generate` + compila para `dist/`
- `npm start` — produção (`node dist/server.js`)
- `npm run typecheck` — verificação de tipos sem emitir arquivos

---

## Arquitetura

### Fluxo de boot → resposta

```
server.ts
  └─ dotenv + app.listen(PORT)
       └─ app.ts
            ├─ cors()
            ├─ express.json()
            ├─ /files → static (uploads)
            └─ routes.ts
                 ├─ rotas públicas → controller
                 └─ rotas protegidas → auth → controller → Prisma → MySQL
```

### Entry point

- `api/src/server.ts` — carrega `.env`, inicia servidor (porta padrão `3001`)
- `api/src/app.ts` — configura middlewares e monta rotas
- `api/src/routes.ts` — define todos os endpoints
- `api/src/database/prisma.ts` — singleton `PrismaClient`
- `api/src/types/express.d.ts` — extensão de tipos para `req.usuario`

### Arquivos estáticos

Imagens de veículos são salvas em `api/uploads` e servidas em:

```
GET /files/{filename}
```

---

## Autenticação e multi-tenancy

### Fluxo

1. **Register** — `POST /auth/register` → cria `Loja` + `Usuario` tipo `ADMIN`
2. **Login** — `POST /usuarios/login` → retorna JWT (expira em 7 dias)
3. **Rotas protegidas** — header `Authorization: Bearer <token>`

### Payload do token

```json
{
  "usuarioid": 1,
  "lojaId": 1,
  "tipo": "ADMIN"
}
```

O middleware `auth.ts` popula `req.usuario` com esses campos.

### Isolamento por loja

Quase todos os controllers filtram por `req.usuario.lojaId`.

**Tipos de usuário:** `ADMIN` | `VENDEDOR`

---

## Modelo de dados (Prisma)

### Entidades principais

| Modelo | Descrição |
|--------|-----------|
| `Loja` | Concessionária (tenant) |
| `Usuario` | Admin ou vendedor, vinculado à loja |
| `Cliente` | Comprador |
| `Veiculo` | Estoque (próprio ou consignado) |
| `HistoricoVeiculo` | Eventos/custos do veículo |
| `Venda` | 1 venda por veículo (`veiculoId` unique) |
| `ContaReceber` | Parcelas pendentes |
| `Comissao` | Comissão do vendedor |
| `Financeiro` | Entradas e saídas |

### Enums

**Veículo — status:** `DISPONIVEL`, `RESERVADO`, `VENDIDO`, `MANUTENCAO`

**Veículo — tipo:** `MOTO`, `CARRO`

**Veículo — estoque:** `PROPRIO`, `CONSIGNADO`

**Financeiro — tipo:** `ENTRADA`, `SAIDA`

**Financeiro / Conta — status:** `PENDENTE`, `PAGO`, `ATRASADO`

### Relacionamentos

```
Loja
 ├── Usuario[]
 ├── Cliente[]
 ├── Veiculo[]
 ├── Venda[]
 └── Financeiro[]

Veiculo ── HistoricoVeiculo[]
Veiculo ── Venda (1:1)
Cliente ── Venda[]
Venda ── ContaReceber[]
Venda ── Comissao (opcional)
Usuario ── Venda[] (como vendedor)
```

---

## Mapa de rotas

### Públicas (sem token)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Health check — `{ status: "API ONLINE" }` |
| POST | `/auth/register` | Cria loja + usuário admin |
| POST | `/usuarios/login` | Login → JWT + dados do usuário |

### Protegidas (Bearer token)

#### Usuários

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/usuarios` | Cadastrar usuário na loja |
| GET | `/usuarios` | Listar usuários da loja |
| GET | `/usuarios/:id` | Detalhar |
| PUT | `/usuarios/:id` | Atualizar |
| DELETE | `/usuarios/:id` | Deletar |

#### Veículos

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/veiculos` | Cadastrar (multipart, campo `imagem`) |
| GET | `/veiculos` | Listar com filtros |
| GET | `/veiculos/:id` | Detalhar |
| GET | `/veiculos/busca/:placa` | Buscar por placa |
| GET | `/veiculos/cards` | Listar (mesmo handler) |
| PUT | `/veiculos/:id` | Atualizar (multipart opcional) |
| DELETE | `/veiculos/:id` | Deletar |

**Query params (listar):** `busca`, `status`, `tipoEstoque`, `tipo`

#### Financeiro

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/financeiro` | Cadastrar movimentação |
| GET | `/financeiro` | Listar com filtros |
| GET | `/financeiro/:id` | Detalhar |
| PUT | `/financeiro/:id` | Atualizar |
| DELETE | `/financeiro/:id` | Deletar |

**Query params:** `mes`, `ano`, `dataInicio`, `dataFim`, `tipo`, `status`, `busca`

#### Vendas

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/vendas` | Criar venda (transação) |
| GET | `/vendas` | Listar com filtros |
| GET | `/vendas/:id` | Detalhar |
| DELETE | `/vendas/:id` | Cancelar venda |

**Query params (listar):** `busca`, `dataInicio`, `dataFim`, `vendedorId`, `formaPagamento`

**Body (criar):**

```json
{
  "clienteId": 1,
  "veiculoId": 1,
  "vendedorId": 2,
  "valorVenda": 50000,
  "formaPagamento": "financiado",
  "entrada": 10000,
  "parcelas": 12,
  "observacoes": ""
}
```

#### Dashboard

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/dashboard` | Indicadores agregados da loja |

#### Histórico de veículo

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/historico` | Cadastrar evento |
| GET | `/historico/:veiculoId` | Listar por veículo |
| DELETE | `/historico/:id` | Deletar |

#### Contas a receber

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/contas-receber` | Cadastrar parcela manual |
| GET | `/contas-receber` | Listar todas |
| PUT | `/contas-receber/:id` | Marcar como PAGO |

#### Clientes

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/clientes` | Cadastrar |
| GET | `/clientes` | Listar (`?busca=`) |
| GET | `/clientes/:id` | Detalhar |
| PUT | `/clientes/:id` | Atualizar |
| DELETE | `/clientes/:id` | Deletar |

#### Documentos (PDF)

| Método | Rota | Documento |
|--------|------|-----------|
| GET | `/documentos/contrato/:vendaId` | Contrato de compra e venda |
| GET | `/documentos/recibo/:vendaId` | Recibo de pagamento |
| GET | `/documentos/termo-entrega/:vendaId` | Termo de entrega |
| GET | `/documentos/termo-responsabilidade/:vendaId` | Termo de responsabilidade |
| GET | `/documentos/relatorio-interno/:vendaId` | Relatório interno |

#### Comissões

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/comissoes` | Resumo por vendedor (total vendido + comissão) |

---

## Fluxos de negócio

### 1. Onboarding

```
POST /auth/register
  → valida email único
  → cria Loja
  → cria Usuario ADMIN (senha bcrypt)
  → retorna usuário (sem token)

POST /usuarios/login
  → valida credenciais
  → retorna JWT (7d) + dados do usuário
```

### 2. Cadastro de veículo

```
POST /veiculos (multipart/form-data)
  → salva imagem em uploads/ (opcional)
  → Veiculo.create com lojaId
  → status default: DISPONIVEL
```

### 3. Criar venda (transação atômica)

```
POST /vendas
  1. Valida veículo (existe, não VENDIDO, mesma loja)
  2. Valida cliente (mesma loja)
  3. Valida vendedor (opcional)
  4. Calcula lucro = valorVenda - valorCompra
  5. prisma.$transaction:
     a. Venda.create
     b. Veiculo.status → VENDIDO
     c. Financeiro ENTRADA PAGO (entrada ou valorVenda)
     d. Se parcelas > 1: N × ContaReceber PENDENTE
     e. Se vendedor com %: Comissao.create
```

### 4. Cancelar venda

```
DELETE /vendas/:id
  prisma.$transaction:
    → Veiculo.status → DISPONIVEL
    → remove ContaReceber
    → remove Comissao
    → remove Venda
  (não remove lançamento Financeiro da venda)
```

### 5. Histórico do veículo

```
POST /historico
  → HistoricoVeiculo.create
  → se valor > 0: Financeiro SAIDA PAGO na loja do veículo
```

### 6. Dashboard

```
GET /dashboard
  → contagens de veículos (total, vendidos, consignados, disponíveis, manutenção)
  → estoque não vendido: soma valorCompra / valorVenda, lucro previsto
  → financeiro: soma entradas vs saídas → saldo
```

---

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `PORT` | Porta do servidor (default: 3001) |
| `DATABASE_URL` | Connection string MySQL (Prisma) |
| `DIRECT_URL` | URL direta MySQL |
| `JWT_SECRET` | Segredo para assinar/validar tokens |

---

## Estrutura de pastas

```
api/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── server.ts
│   ├── app.ts
│   ├── routes.ts
│   ├── types/
│   │   └── express.d.ts
│   ├── database/
│   │   └── prisma.ts
│   ├── middlewares/
│   │   ├── auth.ts
│   │   └── upload.ts
│   └── controller/
│       ├── ctusuarios.ts
│       ├── ctveiculos.ts
│       ├── ctvendas.ts
│       ├── ctfinanceiro.ts
│       ├── ctdashboard.ts
│       ├── cthistorico.ts
│       ├── ctcontasreceber.ts
│       ├── ctclientes.ts
│       ├── ctcomissao.ts
│       └── ctdocumentos.ts
├── dist/          (gerado pelo build)
├── uploads/       (imagens de veículos)
├── tsconfig.json
├── .env
├── .gitignore
└── package.json
```

---

## Fluxo típico do front-end

```
1. POST /auth/register        (primeira vez)
2. POST /usuarios/login       → guardar token
3. CRUD /clientes
4. CRUD /veiculos             (imagem via multipart)
5. POST /vendas               → estoque VENDIDO + financeiro + parcelas
6. GET /dashboard
7. GET /comissoes
8. PUT /contas-receber/:id    (ao receber parcela)
9. GET /documentos/*/:vendaId (PDFs)
```

---

## Observações conhecidas

| # | Problema |
|---|----------|
| 1 | ~~Ordem de rotas veículos~~ — corrigido: `/busca` e `/cards` antes de `/:id` |
| 2 | ~~Campo `complemento` em clientes~~ — removido na migração TS |
| 3 | `GET /contas-receber` lista sem filtro `lojaId` |
| 4 | Histórico não valida ownership por loja |
| 5 | Cancelamento de venda não remove lançamento Financeiro |
| 6 | ~~`ctvendas` PrismaClient duplicado~~ — corrigido, usa singleton |
| 7 | ~~Multer duplicado~~ — centralizado em `upload.ts` |
| 8 | Sem controle de roles (ADMIN vs VENDEDOR) nas rotas |
| 9 | Sem paginação nas listagens |

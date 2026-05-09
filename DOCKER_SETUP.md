# Docker Setup — AcquireFlow

Referência completa para rodar, configurar e fazer deploy do **AcquireFlow** com Docker.

---

## Visão Geral

**AcquireFlow** é uma API REST TypeScript/Express com Drizzle ORM e Neon PostgreSQL (serverless).

- **Desenvolvimento** → Neon Local (container) cria branches efêmeros por branch git; a app roda com hot-reload via `tsx watch`
- **Produção** → Banco gerenciado pelo Neon Cloud; a app roda a partir do `dist/` compilado, em usuário não-root

```
Desenvolvimento
───────────────
Request → app:dev (tsx watch :3000) → neon-local (:5432) → Neon Cloud (branch ephemeral)

Produção
────────
Request → app:prod (node dist/index.js :3000) → Neon Cloud (pooled endpoint)
```

---

## Estrutura de Arquivos Docker

```
.
├── Dockerfile                  # Multi-stage: base → deps → builder → dev | prod
├── .dockerignore
├── docker-compose.dev.yml      # Desenvolvimento com Neon Local
├── docker-compose.prod.yml     # Produção (banco no Neon Cloud)
├── dev.sh                      # Script de startup para desenvolvimento
├── .env.development            # ⚠️ não commitar — variáveis de dev
├── .env.production             # ⚠️ não commitar — variáveis de prod
├── .env.example                # ✅ versionar — template sem segredos
└── .neon_local/                # gerado automaticamente (no .gitignore)
```

---

## Stages do Dockerfile

| Stage         | Base            | O que faz                                                     |
|---------------|-----------------|---------------------------------------------------------------|
| `base`        | node:22-alpine  | Instala `postgresql-client`, `dumb-init`, `curl`              |
| `deps`        | base            | `npm ci --frozen-lockfile` — camada cacheável                 |
| `builder`     | deps            | `npm run build` → compila TypeScript para `dist/`             |
| `development` | deps            | Código via bind-mount, `npm run dev` (tsx watch)              |
| `production`  | base            | Só deps de prod + `dist/`, usuário não-root, healthcheck      |

> **Path aliases** (`#config/`, `#controllers/`, `#service/`, `#utils/`, `#models/`, `#validations/`)
> são resolvidos pelo `tsx` em dev (via `tsconfig.json`) e devem ser resolvidos pelo seu
> build script em produção (via `tsc-alias`, `tsconfig-paths` ou equivalente).

---

## Pré-requisitos

| Ferramenta     | Versão mínima |
|----------------|---------------|
| Docker         | 24+           |
| Docker Compose | v2 (embutido) |
| Node.js        | 22            |
| npm            | 10+           |

---

## Desenvolvimento

### 1. Configurar variáveis de ambiente

```bash
cp .env.example .env.development
```

**Variáveis necessárias em `.env.development`:**

```dotenv
# Neon Local — credenciais do projeto Neon
NEON_API_KEY=your_neon_api_key
PROJECT_ID=your_project_id

# App
NODE_ENV=development
PORT=3000

# Drizzle ORM — aponta para o container neon-local
DB_URL=postgres://neon:npg@neon-local:5432/neondb
```

> **Atenção:** A variável é `DB_URL` (não `DATABASE_URL`), conforme `src/config/database.ts`.

### 2. Iniciar o ambiente

```bash
chmod +x dev.sh
./dev.sh
```

O script executa os seguintes passos em ordem:

1. Valida pré-requisitos (`.env.development`, Docker)
2. Cria `.neon_local/` e `logs/` se não existirem
3. Sobe os containers em background (`docker compose up -d`)
4. Aguarda o `neon-local` passar no healthcheck (`pg_isready`)
5. Executa `npm run db:migrate` (Drizzle Kit)
6. Faz tail dos logs do container `app`

### Flags disponíveis

```bash
./dev.sh --build          # Força rebuild das imagens
./dev.sh --reset          # Remove volumes e reinicia do zero
./dev.sh --build --reset  # Combinado
```

### Comandos do dia a dia

```bash
# Status dos containers
docker compose -f docker-compose.dev.yml ps

# Logs em tempo real (todos os serviços)
docker compose -f docker-compose.dev.yml logs -f

# Logs só da app
docker compose -f docker-compose.dev.yml logs -f app

# Shell dentro do container da app
docker compose -f docker-compose.dev.yml exec app sh

# Acessar o banco diretamente
docker compose -f docker-compose.dev.yml exec neon-local \
  psql -U neon -d neondb

# Drizzle Studio (roda fora do container, conecta ao neon-local)
npm run db:studio

# Parar containers (sem remover volumes)
docker compose -f docker-compose.dev.yml down

# Parar e remover volumes (reset completo)
docker compose -f docker-compose.dev.yml down -v
```

---

## Produção

### 1. Configurar variáveis de ambiente

```bash
cp .env.example .env.production
```

**Variáveis necessárias em `.env.production`:**

```dotenv
NODE_ENV=production
PORT=3000

# Neon Cloud — use o pooled connection string (melhor para serverless/containers)
DB_URL=postgresql://user:pass@ep-xxx-yyy.region.neon.tech/neondb?sslmode=require
```

### 2. Build e deploy

```bash
# Buildar a imagem (tag gerada a partir de APP_VERSION)
APP_VERSION=1.0.0 docker compose -f docker-compose.prod.yml build

# Subir em background
APP_VERSION=1.0.0 docker compose -f docker-compose.prod.yml up -d

# Verificar saúde (aguarde ~15s após subir)
docker compose -f docker-compose.prod.yml ps

# Checar o healthcheck manualmente
curl http://localhost:3000/health
```

### Variáveis de produção

| Variável      | Descrição                                               | Obrigatória |
|---------------|---------------------------------------------------------|-------------|
| `DB_URL`      | Connection string Neon Cloud (pooled)                   | ✅           |
| `NODE_ENV`    | Deve ser `production`                                   | ✅           |
| `PORT`        | Porta da aplicação (padrão: `3000`)                     | ❌           |
| `APP_VERSION` | Tag da imagem (ex: `1.2.3` ou SHA do commit)            | ❌           |

---

## Endpoints Disponíveis

A partir da implementação atual do `app.ts`:

| Método | Rota                | Descrição                  | Status |
|--------|---------------------|----------------------------|--------|
| GET    | `/`                 | Hello check                | ✅      |
| GET    | `/health`           | Health check com uptime    | ✅      |
| GET    | `/api`              | API status                 | ✅      |
| POST   | `/api/auth/sign-up` | Cadastro de usuário        | ✅      |
| POST   | `/api/auth/sign-in` | Login                      | 🔄 stub |
| POST   | `/api/auth/sign-out`| Logout                     | 🔄 stub |

O healthcheck do Docker aponta para `GET /health` (retorna `200 OK` com uptime).

---

## Troubleshooting

### `DB_URL` vs `DATABASE_URL`

O projeto usa `DB_URL` em `src/config/database.ts`. Certifique-se que seus arquivos `.env.*` usam exatamente esse nome.

### Path aliases não resolvidos em produção

Se `node dist/index.js` lançar erro de `Cannot find module '#config/...'`, o build não está resolvendo os aliases. Adicione ao `package.json`:

```bash
npm install -D tsc-alias
```

E em `package.json`:

```json
"build": "tsc && tsc-alias"
```

### Container da app reinicia em loop

```bash
docker compose -f docker-compose.dev.yml logs app
```

Causas comuns:
- `DB_URL` incorreta ou neon-local ainda não saudável
- Erro de compilação TypeScript

### `node_modules` do host conflitando com o container

O volume anônimo `/app/node_modules` tem precedência sobre o bind-mount. Se ainda assim houver conflito:

```bash
./dev.sh --reset
```

### Neon Local não fica `healthy`

```bash
docker compose -f docker-compose.dev.yml logs neon-local
```

Verifique `NEON_API_KEY` e `PROJECT_ID` no `.env.development`.

---

## Segurança

- **Imagem de produção roda como usuário não-root** (`appuser`)
- **Segredos nunca entram na imagem** — fornecidos via `env_file` em runtime
- **`.dockerignore`** exclui todos os `.env.*` reais, `node_modules`, `dist` e `.git`
- **`dumb-init`** garante forwarding correto de sinais (`SIGTERM`) para shutdown graceful
- **Cookies JWT** com `httpOnly`, `secure` (prod) e `sameSite: strict` — configurados em `src/models/user.model.ts`
# RegistAgro-Backend-1.0
RegistAgro Backend

# Instalação necessária
Antes de começar, garante que tenha istalado em sua máquina:

Node.Js && NPM

Docker

# Baixe o repositório
```bash
git clone https://github.com/RegistAgro-project-community/RegistAgro-Backend-1.0.git
```

# Instalale as dependencias
```bash
npm install
```

# Arquivo .env
Vos enviarei pelo WatsApp

# Principais comandos
```bash
docker compose -f docker-compose.yaml -f deploy/docker-compose.scale.yaml up --build --scale api=3 -d

npx prisma db seed

npx prisma generate

npx prisma studio
```

# Executar servidor
```bash
npm run api
```

# Documentação da API
http://localhost/docs

# Testes da API
Insomnia

# API local com Docker

Executa os comandos Docker na raiz do repositorio. O primeiro comando constroi as imagens, aplica as migracoes Prisma e inicia PostgreSQL, Redis, tres replicas da API e o balanceador Nginx:

```bash
docker compose -f docker-compose.yaml -f deploy/docker-compose.scale.yaml up --build --scale api=3 -d
```

Nos arranques seguintes, omite `--build` se o codigo nao tiver mudado:

```bash
docker compose -f docker-compose.yaml -f deploy/docker-compose.scale.yaml up --scale api=3 -d
```

Volta a usar `--build` depois de alterar o codigo. Consulta o estado dos servicos e os logs da API com:

```bash
docker compose -f docker-compose.yaml -f deploy/docker-compose.scale.yaml ps
docker compose -f docker-compose.yaml -f deploy/docker-compose.scale.yaml logs -f api
```

Para parar os servicos sem remover os volumes de dados:

```bash
docker compose -f docker-compose.yaml -f deploy/docker-compose.scale.yaml down
```

A URL base local da API e `http://localhost`; o Swagger fica em `http://localhost/docs`. Define a URL do Flutter no build com `--dart-define=API_BASE_URL=http://localhost`. No emulador Android, usa `http://10.0.2.2`. Num telefone fisico, usa o IPv4 local do computador (por exemplo, `http://192.168.1.25`); ambos devem estar na mesma rede e a firewall do Windows deve permitir trafego de entrada na porta 80.

O Compose le credenciais e configuracoes de `.env`. Define `DATABASE_URL_DOCKER` com o hostname `postgres` da rede Compose e configura as variaveis Supabase e de split de pagamento listadas em `.env.example`. O modo local usa `NODE_ENV=development`; producao exige credenciais Turnstile validas e `NODE_ENV=production`.

O PostgreSQL local fica acessivel no computador em `localhost:5432`, apenas pelo loopback, para ferramentas como Prisma Studio. Com os containers iniciados, executa na raiz do projeto:

```bash
npx prisma studio
```

O Studio mostra os modelos/tabelas do schema ligado a `DATABASE_URL`. Para consultar o estado do historico de migracoes, usa:

```bash
npx prisma migrate status
```

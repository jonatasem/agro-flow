# 🚜 AgroFlow - API de Gestão de Ordens de Serviço & Manutenção

API RESTful desenvolvida para gestão inteligente de Ordens de Serviço (O.S.), manutenção de frotas e acompanhamento de equipes de campo no setor agroindustrial.

---

## Tecnologias Utilizadas

- *Linguagem:* [TypeScript](https://www.typescriptlang.org/)
- *Runtime:* [Node.js](https://nodejs.org/)
- *Framework Web:* [Fastify](https://fastify.dev/)
- *ORM:* [Prisma](https://www.prisma.io/)
- *Banco de Dados:* [MongoDB](https://www.mongodb.com/)
- *Autenticação:* JWT (JSON Web Token)
- *Validação & Utilitários:* Fastify Hooks, Middleware de Autenticação

---

## Funcionalidades Principais

    - *Autenticação e Permissões:* Controle de acesso por cargos (Admin, Líder, COA, Técnico).
    - *Gestão de Ordens de Serviço (Work Orders):* Abertura, listagem, atualização e fechamento automático.
    - *Atendimento por Setor (Sector Service):*
    - *Início de Atendimento (/start):* Atribuição do técnico responsável e timestamp de início.
    - *Controle de Pausas (/pause):* Registro de justificativas (PAUSADO_PECA ou PAUSADO_OUTRO_SETOR) e histórico temporal.
    - *Retomada (/resume):* Fechamento do ciclo de pausa e retorno ao status EM_MANUTENCAO.
    - *Finalização (/finish):* - Cálculo automático do *tempo líquido trabalhado* (descontando pausas).
    - Vínculo das *peças/insumos* e *ferramentas* utilizadas.
    - Fechamento automático da Ordem de Serviço principal quando todos os setores forem concluídos.
    - *Gestão de Cadastros:* Colaboradores, Equipamentos/Frotas e Operadores.

---

## Fluxo de Atendimento do Setor


[ AGUARDANDO_MANUTENCAO ] -> (/start) -> [ EM_MANUTENCAO ] -> (/pause) -> [ PAUSADO ] -> (/resume) -> (/finish) -> [ FINALIZADO ]

---

## Como Executar o Projeto

### Pré-requisitos
- *Node.js* (v18 ou superior)
- *npm* ou *yarn* / *pnpm*
- Instância do *MongoDB* (Local ou MongoDB Atlas)

### 1. Clonar o repositório

```bash
git clone https://github.com/jonatasem/agroflow.git
```

### 2. Entrar na pasta server

```bash
cd server
```

### 3. Baixar as dependências do backend

```bash
npm install 
```

### 4. Configurar as Variáveis de Ambiente (.env) na raiz do projeto com a seguinte estrutura:

```bash
DATABASE_URL="mongodb+srv://<usuario>:<senha>@cluster.mongodb.net/agroflow?retryWrites=true&w=majority"
JWT_SECRET="sua_chave_secreta_jwt"
PORT=3333
```

### 5. Sincronizar o Banco de Dados com o Prisma

```bash
npx prisma generate
```
### 6. Executar o server

```bash
npm run dev
```

### 7. Acessar a url do servidor.

```bash
http://localhost:3333
```

---

## Documentação das Rotas (API Endpoints)

### Autenticação e Acesso Público

| Método | Rota | Descrição |
|---|---|---|
| POST | /login | Realiza login do colaborador e retorna o token JWT <br /> 
| POST | /collaborator | Cadastro inicial de colaborador <br /> 
| POST | /login/check-registration | Verifica o cadastro antes do login <br /> 

### Rotas Protegidas (Bearer Token necessário)

#### Ordens de Serviço (WorkOrder)

| Método | Rota | Descrição |
|---|---|---|
| POST | /work-order | Cria uma nova Ordem de Serviço |
| GET | /work-order | Lista todas as Ordens de Serviço |

#### Serviços de Setor (SectorService)

| Método | Rota | Descrição |
|---|---|---|
| PUT | /sector-service/:id/start | Inicia o atendimento de um setor específico |
| PUT | /sector-service/:id/pause | Pausa o atendimento (Exige reason e description) |
| PUT | /sector-service/:id/resume | Retoma um atendimento que estava pausado |
| PUT | /sector-service/:id/finish | Finaliza o atendimento, registra peças/ferramentas e calcula o tempo líquido |
| PUT | /sector-service/:id | Atualiza dados gerais do serviço |
| DELETE | /sector-service/:id | Remove um serviço de setor |

#### Exemplo de Payload - Pausar Serviço (PUT /sector-service/:id/pause):
```bash
{
  "reason": "PAUSADO_PECA",
  "description": "Faltando fio PP 2/1"
}
```

#### Exemplo de Payload - Finalizar Serviço (PUT /sector-service/:id/finish):
```bash
{
  "solucaoTecnico": "Troca de fiação e substituição do fusível principal.",
  "tipoCausa": "DESGASTE_NATURAL",
  "usedPartIds": [
    { "partId": "66b123...", "quantity": 2 }
  ],
  "usedToolIds": ["66c456..."]
}
```

Colaboradores (Collaborator)

| Método | Rota | Descrição |
|---|---|---|
| GET | /collaborator | Lista colaboradores cadastrados |
| PUT | /collaborator/:id | Atualiza dados do colaborador |
| DELETE | /collaborator/:id | Remove um colaborador |

Equipamentos (Equipment)

| Método | Rota | Descrição |
|---|---|---|
| GET | /equipment | Lista equipamentos da frota |
| POST | /equipment | Cadastra um novo equipamento |
| PUT | /equipment/:id | Atualiza dados do equipamento |
| DELETE | /equipment/:id | Remove um equipamento |

Operadores (Operator)

| Método | Rota | Descrição |
|---|---|---|
| GET | /operator | Lista operadores de campo |
| POST | /operator | Cadastra um novo operador |
| PUT | /operator/:id | Atualiza dados do operador |
| DELETE | /operator/:id | Remove um operador |
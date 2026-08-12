# AgroFlow - Front-End

Interface web moderna e responsiva do *AgroFlow*, desenvolvida para o acompanhamento e gestão em tempo real de Ordens de Serviço (O.S.), manutenção de frotas e gerenciamento de equipes no setor agroindustrial.

---

## Tecnologias Utilizadas

- *Framework Web:* [React.js](https://react.dev/)
- *Linguagem:* [TypeScript](https://www.typescriptlang.org/)
- *Ferramenta de Build:* [Vite](https://vitejs.dev/)
- *Estilização:* [Tailwind CSS](https://tailwindcss.com/)
- *Ícones:* [Lucide React](https://lucide.dev/) (ou Phosphor Icons)
- *Requisições HTTP:* [Axios](https://axios-http.com/)
- *Gerenciamento de Estado:* Context API / Custom Hooks
- *Roteamento:* [React Router DOM](https://reactrouter.com/)

---

## Funcionalidades Principais

- *Autenticação & Controle de Acesso (RBAC):*
  - Diferenciação visual e permissões por perfil (Admin, Líder, COA, Técnico).
  - Proteção de rotas e armazenamento seguro do token JWT.

- *Gestão e Monitoramento de Ordens de Serviço:*
  - Visualização dinâmica do status das ordens de serviço (AGUARDANDO_MANUTENCAO, EM_MANUTENCAO, PAUSADO, FINALIZADO).
  - Modal de abertura de O.S. com seleção de equipamento, operador, tipo de manutenção e setor.

- *Fluxo de Atendimento do Técnico:*
  - *Iniciar Atendimento (Start):* Vincula o técnico logado ao serviço.
  - *Pausar Atendimento (Pause):* Modal para seleção do motivo da pausa (PAUSADO_PECA ou PAUSADO_OUTRO_SETOR) e campo descritivo.
  - *Retomar Atendimento (Resume):* Despausa o serviço com apenas um clique.
  - *Finalizar Atendimento (Finish):* Modal completo para inclusão da solução técnica, tipo de causa, seleção de peças/insumos com quantidade e ferramentas utilizadas.

- *Módulos de Cadastro (CRUDs com Modais Reutilizáveis):*
  - Gestão de Colaboradores/Técnicos.
  - Gestão de Equipamentos/Frota.
  - Gestão de Operadores.

- *UX/UI & Resiliência:*
  - Componentes e modais dinâmicos e reutilizáveis.
  - Tratamento visual de erros e feedbacks (Toasts/Alerts).
  - Layout 100% responsivo otimizado para tablets e desktops de campo.

---

## Como Executar o Projeto

### Pré-requisitos
- *Node.js* (v18 ou superior)
- *npm, **yarn* ou *pnpm*
- API Backend do AgroFlow em execução (http://localhost:3333 por padrão)

### 1. Clonar o repositório
```bash
git clone https://github.com/jonatasem/agroflow-web.git
```

### 2. Entrar na pasta do client
```bash
cd agroflow
```

### 3. Instalar as dependências
```bash
npm install
```

### 4. Configurar as Variáveis de Ambiente (.env) na raiz do projeto:
```bash
VITE_API_URL=http://localhost:3333
```

###  5. Executar em modo de desenvolvimento
```bash
npm run dev
```

### 6. Acesse a aplicação no seu navegador pelo endereço fornecido pelo Vite em:

```bash
http://localhost:5173
```

### Integração com o Backend

```text
Este front-end consome a AgroFlow API (desenvolvida em Node.js / Fastify / Prisma / MongoDB).

Certifique-se de que o backend esteja ativo e com a URL devidamente configurada na variável VITE_API_URL.
```

### Autor

## Desenvolvido por Jonatas Elieser Moreira

 * LinkedIn: linkedin.com/in/jonatas-moreira
 * E-mail: jonatas.em25@gmail.com
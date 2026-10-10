# 🌾 AgroFlow - Sistema de Gestão Operacional Agrícola (CMMS)

> Sistema corporativo desenvolvido para otimizar a gestão de ordens de serviço, controle de frotas e manutenção de maquinário agrícola, unindo processos do agronegócio à engenharia de software moderna.

## 🚀 Tecnologias Utilizadas

Este projeto foi construído utilizando a seguinte stack:
- *Backend:* Node.js, Fastify, TypeScript
- *Banco de Dados & ORM:* MongoDB, Prisma ORM
- *Validação & Segurança:* Zod, JWT (Authentication stateless)
- *Testes:* Jest (Testes unitários com padrão AAA e Mocks)
- *Frontend:* React.js, Tailwind CSS

---

## ⚙️ Arquitetura e Decisões de Projeto
- *Padrão Controller-Service:* Separação estrita entre as rotas HTTP e as regras de negócio, facilitando a manutenibilidade e a testabilidade.
- *Validação Defensiva:* Uso do Zod em todas as entradas de dados para garantir integridade em runtime.
- *Cobertura de Testes:* Suíte robusta de testes unitários cobrindo as regras críticas de negócio dos serviços.

---

## 🛠️ Como Executar o Projeto Localmente

Clone o repositório e acesse a pasta raiz:
```bash
git clone https://github.com/jonatasem/agroflow.git
cd agroflow

Configurando e Executando o Backend (/server)
cd server
npm install

Crie um arquivo .env na raiz da pasta server com base no .env.example.
Execute os testes automatizados:
npm test

Inicie o servidor de desenvolvimento:
npm run dev

Configurando e Executando o Frontend (/client)
Abra um novo terminal na raiz do projeto (/agroflow) e execute:
cd client
npm install

Crie um arquivo .env na raiz da pasta client com base no .env.example.
Inicie o ambiente de desenvolvimento do frontend:
npm run dev
```

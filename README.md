# TCC – Sistema de Gerenciamento de Ordens de Manutenção Automotiva

Projeto desenvolvido como Trabalho de Conclusão de Curso (TCC) no curso técnico em Informática. Trata-se de um sistema para gerenciar ordens de manutenção automotiva, construído com tecnologias como **Node.js, JavaScript, jQuery, HTML, CSS, EJS e Less**.

---

## 📑 Índice

1. [Descrição](#descrição)
2. [Tecnologias Utilizadas](#tecnologias-utilizadas)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Pré-requisitos](#pré-requisitos)
5. [Instalação](#instalação)
6. [Execução](#execução)
7. [Funcionalidades](#funcionalidades)
8. [Tipos de Usuário](#tipos-de-usuário)
9. [Banco de Dados](#banco-de-dados)
10. [Possíveis Erros e Soluções](#possíveis-erros-e-soluções)

---

## 📖 Descrição

Este projeto tem como objetivo oferecer um sistema completo de gerenciamento de **ordens de manutenção automotiva**, auxiliando oficinas e empresas do setor a organizar clientes, veículos, serviços e histórico de manutenções.

A interface foi desenvolvida com tecnologias web modernas, garantindo um sistema dinâmico, responsivo e fácil de usar.

---

## 🛠 Tecnologias Utilizadas

* **Node.js** – backend da aplicação
* **JavaScript** – lógica de front-end
* **jQuery** – manipulação DOM e integração via AJAX
* **HTML / CSS / Less** – estruturação e estilização das páginas
* **EJS** – templates no servidor para páginas dinâmicas
* **MySQL** – banco de dados relacional

---

## 📂 Estrutura do Projeto

```
├── src/                   # Código-fonte da aplicação (rotas, lógicas e controllers)
├── public/                # Arquivos públicos (CSS, JS, imagens)
├── views/                 # Templates EJS para renderização das páginas
├── sessions/              # Configuração de sessões e autenticação
├── BANCODEDADOSTCC.txt    # Arquivo com instruções/scripts do banco de dados
├── package.json           # Dependências e scripts do npm
└── package-lock.json      # Versão exata das dependências
```

---

## ⚙️ Pré-requisitos

Antes de executar o projeto, instale:

* [Node.js](https://nodejs.org/)
* [npm](https://www.npmjs.com/)
* [MySQL](https://dev.mysql.com/downloads/) 

---

## 📦 Instalação

Clone o repositório e instale as dependências:

```cmd
git clone https://github.com/joaovs12009/TCC---Sistema-de-Gerenciamento-de-Ordens-de-manutencao-automotiva.git
cd TCC---Sistema-de-Gerenciamento-de-Ordens-de-manutencao-automotiva
npm install
```

---

## 🚀 Execução

1. Configure o banco de dados conforme instruções do arquivo `BANCODEDADOSTCC.txt`.
2. Inicie o servidor:

```cmd
npm start
```

3. Acesse no navegador:

```
http://localhost:3000
```

---

## ✅ Funcionalidades

* Cadastro, listagem e edição de **ordens de manutenção**
* Registro de **clientes e veículos**
* Gestão de **serviços realizados**
* Controle de **autenticação e sessões**
* Interface dinâmica com **jQuery + AJAX**
* Banco de dados com tabelas pré-definidas

---

## 👥 Tipos de Usuário

O sistema possui três tipos principais de usuários, cada um com acesso a telas específicas:

1. **Cliente**

   * Visualiza suas ordens de manutenção
   * Consulta histórico de serviços
   * Solicita novos serviços

2. **Técnico**

   * Acessa ordens atribuídas
   * Atualiza status de manutenção
   * Registra serviços realizados

3. **Gerente**

   * Gerencia clientes, técnicos e ordens
   * Gera relatórios de manutenção
   * Configura permissões e usuários do sistema

---

## 🗄 Banco de Dados

O arquivo `BANCODEDADOSTCC.txt` contém:

* Estrutura de tabelas
* Scripts de criação
* Instruções de configuração

Sugestão: importar o arquivo em um banco **MySQL** para inicializar as tabelas.

---

## ⚠️ Possíveis Erros e Soluções

* **Erro de conexão com MySQL**:

  * Verifique se o banco está em execução
  * Confirme usuário, senha e porta no arquivo de configuração

* **Erro 404 nas páginas EJS**:

  * Confirme se os templates estão na pasta correta (`views/`)
  * Verifique rotas no `src/`

* **Problemas de sessão ou login**:

  * Confira se a configuração de sessões está ativa
  * Limpe cookies ou reinicie o navegador

* **Dependências não instaladas**:

  * Rode `npm install` novamente
  * Certifique-se de que está usando a versão correta do Node.js

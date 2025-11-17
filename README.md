# **Key Author – KEYER 🔑**

O **Key Author – KEYER** é um serviço completo de autenticação e gerenciamento de permissões voltado para aplicações que precisam controlar acesso via **API Keys**, **Licenças**, **JWT** e **gestão de usuários**.
Inclui módulos de administração, webhook, permissões avançadas e suporte a múltiplas aplicações.

---

## 🚀 **Principais Recursos**

* 🔐 Autenticação via API
* 👤 Gerenciamento completo de usuários
* 🪪 Licenças com validação
* 🧩 Múltiplas aplicações registradas
* 🛠 Controles administrativos
* 📡 Envio de status via Webhook
* 🖼 Upload de avatar
* 🔑 Validação JWT integrada

---

## 📚 **Funcionalidades da API**

A API é dividida em módulos para melhor organização:

---

## ### **👤 Users (Usuários)**

| Função                 | Descrição                    |
| ---------------------- | ---------------------------- |
| **Create**             | Criar novo usuário           |
| **Login**              | Autenticação do usuário      |
| **Confirmation Email** | Enviar e-mail de 2FA         |
| **List**               | Listar todos os usuários     |
| **Search by ID**       | Buscar usuário por ID        |
| **Delete**             | Deletar usuário              |
| **Update**             | Atualizar dados do usuário   |
| **Avatar Upload**      | Enviar avatar                |
| **Validate JWT**       | Validar token JWT do usuário |

---

## ### **📦 Applications (Aplicações)**

| Função           | Descrição                    |
| ---------------- | ---------------------------- |
| **Create**       | Criar nova aplicação         |
| **List**         | Listar todas as aplicações   |
| **Search by ID** | Buscar aplicação por ID      |
| **Delete**       | Excluir aplicação            |
| **Update**       | Atualizar dados da aplicação |

---

## ### **🪪 Licenses (Licenças)**

| Função            | Descrição                     |
| ----------------- | ----------------------------- |
| **Create**        | Criar nova licença            |
| **Validate**      | Validar licença               |
| **List**          | Listar todas as licenças      |
| **User Licenses** | Listar licenças de um usuário |
| **Update**        | Atualizar dados da licença    |
| **Delete**        | Excluir licença               |

---

## ### **🛠 Admin (Administração)**

| Função                         | Descrição                            |
| ------------------------------ | ------------------------------------ |
| **Set a user admin**           | Conceder privilégio de administrador |
| **Get all licenses and users** | Listar todas licenças e usuários     |
| **Send a status via webhook**  | Enviar status via Webhook            |

---

## 📡 **Endpoints (Exemplos)**

### **Login**

```http
POST /users/login
```

### **Criar Usuário**

```http
POST /users/register
```

### **Listar Licenças**

```http
GET /licenses/list
```

### **Criar Licensas**

```http
POST /licenses/new
```

---

## 🏗 **Tecnologias Utilizadas**

* Node.js
* Prisma
* MongoDB
* JWT
* Webhooks

---

## 📄 **Licença**

Este projeto é distribuído sob a licença **MIT**.

---

## 🤝 Autor

[Luis Fernando](https://github.com/akoows)

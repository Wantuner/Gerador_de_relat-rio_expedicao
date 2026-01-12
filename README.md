
# 📦 Sistema Web de Controle de Expedição


Aplicação web para registro, controle e geração de relatórios de notas fiscais e mercadorias em expedição, desenvolvida com foco em organização operacional, prevenção de erros e automação de processos.

🔗 Demo: https://wantuner.github.io/Gerador_de_relat-rio_expedicao/

🎯 O que este projeto demonstra

  Desenvolvimento de sistema real com regra de negócio

  Integração Frontend + Backend (Supabase)

  Manipulação de estado e CRUD completo

  Validações e prevenção de duplicidade de dados

  Geração de relatórios em PDF

  UI moderna e responsiva

🚀 Funcionalidades Principais

  Cadastro de notas fiscais e pedidos

  Regra de negócio: NF e Pedido não podem se repetir

  Listagem dinâmica

  Edição e exclusão

  Persistência em banco de dados

  Geração de relatório em PDF

🛠️ Tecnologias

  HTML5, CSS3, JavaScript (ES6+)

  Supabase (Backend)

  jsPDF + AutoTable

  Git, GitHub, GitHub Pages

💼 Contexto de Uso

 Projeto desenvolvido como simulação de sistema real para área de logística/expedição, resolvendo problemas comuns como:

  Duplicidade de notas

  Falta de controle centralizado

  Dificuldade na geração de relatórios

👨‍💻 Autor

Wantuner Santos
Desenvolvedor Frontend
GitHub: https://github.com/Wantuner


## Documentação da API

#### Retorna todos os itens

```http
  GET /api/items
```

| Parâmetro   | Tipo       | Descrição                           |
| :---------- | :--------- | :---------------------------------- |
| `api_key` | `string` | **Obrigatório**. A chave da sua API |

#### Retorna um item

```http
  GET /api/items/${id}
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `id`      | `string` | **Obrigatório**. O ID do item que você quer |

#### add(num1, num2)

Recebe dois números e retorna a sua soma.

## Documentação da API

#### Retorna todos os itens

```http
  GET /api/items
```

| Parâmetro   | Tipo       | Descrição                           |
| :---------- | :--------- | :---------------------------------- |
| `api_key` | `string` | **Obrigatório**. A chave da sua API |

#### Retorna um item

```http
  GET /api/items/${id}
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `id`      | `string` | **Obrigatório**. O ID do item que você quer |

#### add(num1, num2)

Recebe dois números e retorna a sua soma.


##📎 Apêndice A – Decisões Técnicas

- O Supabase foi escolhido como backend por oferecer integração rápida com banco de dados, autenticação e API REST.
- O uso de JavaScript puro (Vanilla JS) foi intencional para demonstrar domínio da base da linguagem sem dependência de frameworks.
- A geração de PDF foi implementada com jsPDF e AutoTable por serem bibliotecas estáveis e amplamente utilizadas no mercado.
- O layout em Glassmorphism foi adotado para oferecer uma interface moderna e agradável ao usuário final.



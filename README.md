# Chat Real

Um site de conversas em tempo real com:

- criação de salas;
- entrada por código/link;
- mensagens em tempo real via Socket.IO;
- contador de pessoas online;
- indicador de digitação;
- layout responsivo para celular e computador.

## Rodar no computador

1. Instale Node.js 18+.
2. Abra o terminal nesta pasta.
3. Execute:

```bash
npm install
npm start
```

4. Abra `http://localhost:3000`.

## Colocar na internet

O projeto precisa de um servidor Node.js que mantenha WebSocket/Socket.IO ativo. Faça o deploy dos arquivos em um serviço compatível com Node.js e use o comando:

```bash
npm start
```

### Importante sobre armazenamento

A versão inicial mantém as salas e mensagens na memória do servidor. Isso funciona para uso em tempo real, mas os dados são perdidos se o servidor reiniciar.

Para uma versão de produção "100% persistente", conecte um banco de dados (por exemplo PostgreSQL) e adicione autenticação, moderação, limite de spam e HTTPS.

## Estrutura

- `server.js` — servidor e Socket.IO
- `public/index.html` — interface
- `public/style.css` — visual
- `public/app.js` — cliente em tempo real

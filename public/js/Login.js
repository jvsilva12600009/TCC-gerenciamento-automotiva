// cadastro.js
const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./connection'); // Importe o pool de conexão

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/cadastro', async (req, res) => {
  const { email, senha } = req.body;
  console.log('Dados recebidos:', req.body); // Adicione este log para verificar se os dados estão sendo recebidos corretamente
  const query = ('select * from usuarios where email = ? and senha = ?',[email,senha]);
  try {
    const connection = await pool.getConnection(); // Obtenha uma conexão do pool
    await connection.query(query, [email, senha]); // Execute a query
    connection.release(); // Libere a conexão de volta para o pool
    console.log('Usuário cadastrado com sucesso.');
    res.status(200).send('Usuário logado com sucesso.');
  } catch (err) {
    console.error('Erro ao logar usuário no banco de dados: ', err);
    res.status(500).send('Erro ao logado usuário.');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor Node.js rodando na porta ${PORT}`);
});

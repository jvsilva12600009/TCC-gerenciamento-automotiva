const express = require('express');
const path = require('path');
const app = express();
const pool = require('./utils/connection');
const {sessionMiddleware, validateSession} = require('./middleware/session');

const PORT = 3000;
const PUBLIC_PATH = path.join(__dirname,'../public');

/*Rotas*/
const usuariosController = require('./usuarios/controller');
const produtosController = require('./produtos/produtos.controller');
const veiculosController = require('./veiculos/veiculos.controller')
const agendaController = require('./agenda/agenda.controller')
const orcamentoController = require('./orcamento/orcamento.controller')
const osController= require('./os/os.controller')
const loginRouter = require('./login/routes');
const homeController = require('./home/homecontroller');
const graficoController = require('./grafico/graficocontroller');
const clienteController = require('./cliente/cliente.controller');

//USE
//carregando componentes necessarios da aplicação
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(sessionMiddleware());
app.use(validateSession);
app.use(express.static(PUBLIC_PATH));

//carregando a biblioteca de templates
app.set('view engine', 'ejs');
app.set('views', './views');

/*Rotas da aplicação */  
app.use('/auth/',loginRouter);
app.use('/usuarios',usuariosController);
app.use('/produtos', produtosController);
app.use('/veiculos',veiculosController);
app.use('/agenda',agendaController);
app.use('/orcamento',orcamentoController);
app.use('/os',osController);
app.use('/home',homeController);
app.use('/graficos',graficoController);
app.use('/cliente',clienteController);

app.get('/cadastro', function(req, res){    
  const filePath = path.resolve(__dirname, '../public/login/cadastro.html');
  res.sendFile(filePath);
});

app.listen(PORT, () => {
  console.log(`Servidor Node.js rodando na porta ${PORT}`);
});
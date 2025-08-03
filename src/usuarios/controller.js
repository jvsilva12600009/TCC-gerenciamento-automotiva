const express = require('express');
const path = require('path');
const router = express.Router();
const pool = require('../utils/connection');
const {getUsuarios, criarUsuario, atualizarUsuario, getUsuariosByTipo, removerUsuario} = require('./usuarios.service');
const {list} = require('../utils/apireturn');


router.get('/', (req, res) =>{  
  
  res.render('index', {
    titulo: 'SGO - Usuarios',  
    link:'./usuarios/usuarios', 
    libs: ['/usuarios/usuarios.js'],
    menu:'usuarios',
    usuario: req.session.user
  });

});


router.post('/getUsuarios/', async function(req, res){ 
  const pageNumber = +req.query.jtStartIndex;
  const pageSize = +req.query.jtPageSize;
  const data = await getUsuarios(req.body,pageNumber,pageSize);
  return res.status(200).json(data);
});

router.post('/getClientes/', async function(req, res){ 
  const data = await getUsuariosByTipo(req.query.tipo);
  return res.status(200).json(data);  

});

router.post('/createUsuario', async function(req, res){    
  
  const usuario = await criarUsuario(req.body);
  res.status(200).json(usuario);
  
});

router.post('/updateUsuario', async function(req, res){  

  const usuario = await atualizarUsuario(req.body);
  res.status(200).json(usuario);

});

router.post('/removerUsuario', async function (req, res) {
  const { id } = req.body;
  try {
      await removerUsuario(id);
      res.status(200).json({ message: 'Usuário excluído com sucesso!' });
  } catch (error) {
      res.status(500).json({ error: 'Erro ao excluir usuário: ' + error.message });
  }
});

module.exports = router;

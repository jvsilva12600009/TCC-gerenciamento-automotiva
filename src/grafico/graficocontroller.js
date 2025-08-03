const express = require('express');
const router = express.Router();
const orcamentoService = require('C:/TCC/src/orcamento/orcamento.service'); // Certifique-se de que o caminho está correto
const path = require('path');
const { list } = require('../utils/apireturn');

router.get('/', async (req, res) => {
  try {
    const orcamentoStatus = await orcamentoService.getOrcamentoStatus();
    const show = req.query.show || ''; // Captura o parâmetro 'show' da URL

    res.render('index', {
      titulo: 'SGO - Sistema de Gerenciamento de Oficinas',
      link: './grafico/graficos',
      libs: ['/main/home.js'],
      usuario: req.session.user,
      menu: '',
      orcamentoStatus, // Passando os dados para a view
      show // Passando o parâmetro 'show' para controlar quais gráficos exibir
    });
  } catch (error) {
    console.error('Erro ao carregar status dos orçamentos:', error);
    res.status(500).send('Erro ao carregar status dos orçamentos');
  }
});

module.exports = router;

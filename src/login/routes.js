const express = require('express');
const router = express.Router();
const pool = require('../utils/connection');
const {getUsuarioByEmail, validateSenha} = require('../usuarios/usuarios.service')
const bcrypt = require('bcrypt');


router.get('/logout', (req, res) => { 
    console.log("oi")  
    req.session.destroy(() => {
        res.redirect('/');
        
    });
});

router.get('/login', (req, res) =>{ 
    
    res.render('./login', {
      titulo: 'Produtos',  
      link:'./produtos/produtos', 
      libs: ['/produtos/produtos.js'],
      menu:'produtos'
    });
});
  
router.post('/login', async (req, res, next) => {
    
    try{
        const { email, senha } = req.body;    
        const usuario = await getUsuarioByEmail(email);  
        
        if(!usuario){
            return res.status(401).send('Email ou senha inválida');           
        }

        const isPassworValid = await validateSenha(senha, usuario.senha);  
        if (!isPassworValid){           
            return res.status(401).send('Usuário ou senha inválida');
        }
       
        req.session.user = {
            id: usuario.idusuarios,
            nome: usuario.nome,
            email:usuario.email ,
            tipo:usuario.tipousuario
        };

        req.session.save(function (err) {
            if (err) 
                return next(err)
            if(usuario.tipousuario == 0){
                res.redirect('/cliente');
            }else{
                res.redirect('/home');
            }            
        });       

    }catch(e){
        res.status(500).send('Erro ao buscar usuário');
    }   
});



module.exports = router;
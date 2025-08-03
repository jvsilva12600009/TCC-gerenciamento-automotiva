
const session = require('express-session');

var SQLiteStore = require('connect-sqlite3')(session);
var expiryDate = new Date( Date.now() + 60 * 60 * 10000 ); // 1 hora

var paginas = {
    '/usuarios/' :  function(usuario){
        if(usuario.tipo == 2){
            return true;
        }
        return false;
    },
    '/os/' :  function(usuario){
        if(usuario.tipo == 2 || usuario.tipo == 1){
            return true;
        }
        return false;
    },
    '/produtos/' :  function(usuario){
        if(usuario.tipo == 2){
            return true;
        }
        return false;
    },
    '/veiculos/' :  function(usuario){
        if(usuario.tipo == 2 || usuario.tipo ==1){
            return true;
        }
        return false;
    },
    '/orcamento/' :  function(usuario){
        if(usuario.tipo == 2 || usuario.tipo ==1){
            return true;
        }
        return false;
    },
    '/agenda/' :  function(usuario){
        if(usuario.tipo == 2 || usuario.tipo ==1){
            return true;
        }
        return false;
    },

    '/graficos/' :  function(usuario){
        if(usuario.tipo == 2 || usuario.tipo ==1){
            return true;
        }
        return false;
    },

    '/cliente/' :  function(usuario){
        if(usuario.tipo == 0){
            return true;
        }
        return false;
    },

    '/home/' :  function(usuario){
        console.log("oi", usuario)
        if(usuario.tipo == 0 ){
            return false;
        }
        return true;
    }



}

function validarAcesso(path, usuario){    
    path = path.endsWith('/') ? path : `${path}/`;    
    if(paginas[path]){
        return paginas[path](usuario);
    }
    return true;
}


function sessionMiddleware() {
    return session({
        secret: 'your-secret-key', // Change this to a random string
        store: new SQLiteStore,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false,
            httpOnly: true,           
            expires: expiryDate
          }
    });
}

function validateSession(req, res, next){    
    let path  = req.path;
    
    if (path.indexOf('401.html') != -1 || path == '/' || path.indexOf('js') != -1 || path.indexOf('imgs') != -1 || path.indexOf('css') != -1  || path == '/cadastro' || path.indexOf('login') != -1 || path === '/auth/logout' || path.indexOf('public') != -1) {
       return next();
    }
   
    if (!req.session.user) {        
       return res.status(401).json({erro:'Usuário não autenticado, realize o login para prosseguir'});        
    }   

    if(!validarAcesso(path, req.session.user)){
        
        return res.redirect('/401.html');
        
    }
    
    next();
}

module.exports = {sessionMiddleware, validateSession};

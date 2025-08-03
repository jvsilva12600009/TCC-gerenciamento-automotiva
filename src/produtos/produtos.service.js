// produtos_service.js

const pool = require('../utils/connection');
const execute = require('../utils/db');
const { list, create, update, options } = require('../utils/apireturn');

async function getProdutos(filtros, pageNumber, pageSize) {
    let query = `
        SELECT p.idproduto,
       p.tipo,
       p.descricao,
       p.referencia,
       p.codcategoria,
       c.descricao AS nomecategoria,
       p.valor,
       p.status
  FROM produtos p
 INNER JOIN categoria c ON c.id = p.codcategoria
 WHERE p.status = ? 
    `;
    return execute(async function (connection) {
        let valores = [filtros.status];
        let colunas = [];

        if(filtros.cliente){
            colunas.push(" lower(p.descricao) like CONCAT('%', ?, '%') ");          
            valores.push(filtros.cliente.toString().trim().toLowerCase());
        }

        if(filtros.tipo != -1){
            colunas.push(" tipo = ? ");
            valores.push(filtros.tipo);
        }

        if(filtros.categoria != 0){
            colunas.push(" codcategoria = ? ");
            valores.push(filtros.categoria);
        }

        if(colunas.length > 0){
            query += " AND " + colunas.join(" AND ");
        }
        query += ` ORDER BY idproduto LIMIT ? , ? `;  
        valores.push(pageNumber, pageSize);       
              
        const [rows] = await connection.query(query, valores);
        const [total] = await connection.execute('SELECT count(*) total FROM produtos WHERE  status = 1');
        return list(rows, total[0].total);
    }, {
        message: function (e) {
            return `Erro ao carregar lista de produtos devido a ${e.message}`;
        }
    });
}

async function getProdutosOptions() {
    const query = `
        SELECT p.idproduto "Value", 
               p.descricao "DisplayText",
               p.valor "valor" 
        FROM produtos p
        WHERE p.status = 1
        ORDER BY 2        
    `;
    return execute(async function (connection) {
        const [rows] = await connection.query(query);
        return options(rows,'produtos');
    }, {
        message: function (e) {
            return `Erro ao carregar lista de produtos devido a ${e.message}`;
        }
    });
}

async function criarProduto(produto) {
    

    const query = 'INSERT INTO produtos (tipo, descricao, referencia, codcategoria, valor) VALUES ( ?, ?, ?, ?, ?)';
    return execute(async function (connection) {
        const valores = [produto.tipo, produto.descricao, produto.referencia, produto.codcategoria, produto.valor.toString().replace(',', '.'),  ];
        const product = await connection.query(query, valores);
        produto.idproduto = product.insertId;
        return create(produto);
    }, {
        message: function (e) {
            return 'Erro ao cadastrar produto, verifique os campos e tente novamente';
        }
    });
}

async function atualizarProduto(produto) {
    return execute(async function (connection) {
        // Verifica se o produto está associado a um orçamento ativo (orcamento.status = 1)
        const queryOrcamentoAtivo = `
            SELECT op.codorcamento
            FROM orcamento_produtos op
            INNER JOIN orcamento o ON o.idorcamento = op.codorcamento
            WHERE op.codproduto = ? AND o.status = 0
        `;

        // Executa a consulta para verificar orçamentos ativos
        const [orcamentosAtivos] = await connection.query(queryOrcamentoAtivo, [produto.idproduto]);

        // Se existir um orçamento ativo, bloquear a inativação (produto.status = 0)
        if (orcamentosAtivos.length > 0 && produto.status == 0) {
            throw new Error('Não é possível inativar o produto, pois ele está vinculado a um orçamento ativo.');
        }

        // Atualizar o produto se não houver orçamentos ativos ou se o status não for 0 (inativo)
        const queryUpdateProduto = `
            UPDATE produtos SET 
                tipo = ?, 
                descricao = ?, 
                referencia = ?, 
                codcategoria = ?,
                valor = ?, 
                status = ?
            WHERE idproduto = ?
        `;
        const parametros = [
            produto.tipo,
            produto.descricao,
            produto.referencia,
            produto.codcategoria,
            produto.valor.toString().replace(',', '.'),
            produto.status,
            produto.idproduto
        ];

        await connection.query(queryUpdateProduto, parametros);

        return update(produto);
    }, {
        message: function (e) {
            if (e.message === 'Não é possível inativar o produto, pois ele está vinculado a um orçamento ativo.') {
                return e.message;
            }
            return 'Erro ao atualizar produto, verifique os campos e tente novamente';
        }
    });
}




async function removerProduto(id) {
    const query = 'DELETE FROM produtos WHERE idproduto = ?';
    return execute(async function (connection) {
        await connection.query(query, [id]);
    }, {
        message: function (e) {
            return 'Erro ao excluir produto devido a ' + e.message;
        }
    });
}
async function getCategorias(pageNumber, pageSize) {
    let valores=[];
    let query = `
        SELECT id,descricao,status FROM categoria
        
    `;
    valores.push(pageNumber, pageSize);  
    return execute(async function (connection) {
             
        query += ` ORDER BY id LIMIT ? , ? `;
        const [rows] = await connection.query(query, valores);
        const [total] = await connection.execute('SELECT count(*) total FROM categoria;');
        return list(rows, total[0].total);
    }, {
        message: function (e) {
            return `Erro ao carregar lista de produtos devido a ${e.message}`;
        }
    });
}

async function criarCategoria(categoria) {
    

    const query = 'INSERT INTO categoria (descricao) VALUES ( ?)';
    return execute(async function (connection) {
        const valores = [categoria.descricao,  categoria.status ];
        const product = await connection.query(query, valores);
        categoria.id = product.insertId;
        return create(categoria);
    }, {
        message: function (e) {
            console.log(e);
            return 'Erro ao cadastrar produto, verifique os campos e tente novamente';
           
        }
    });
}

async function atualizarCategoria(categoria) {
    return execute(async function (connection) {

        
        // Verificar se a categoria está associada a um produto ativo (status = 1)
        const queryProdutosAtivos = `
            SELECT p.idproduto
            FROM produtos p
            WHERE p.codcategoria = ? AND p.status = 1
        `;

        // Executa a consulta para verificar produtos ativos
        const [produtosAtivos] = await connection.query(queryProdutosAtivos, [categoria.id]);

        // Se existir produto ativo, bloquear a inativação (categoria.status = 0)
        if (produtosAtivos.length > 0 && categoria.status == 0) {
            throw new Error('Categoria não pode ser inativada, pois está associada a produtos ativos.');
        }

        // Atualizar a categoria se não houver produtos ativos ou se o status não for 0
        const queryUpdateCategoria = `
            UPDATE categoria SET 
            descricao = ?, 
            status = ?
            WHERE id = ?
        `;

        const parametros = [
            categoria.descricao,
            categoria.status,
            categoria.id
        ];

        await connection.query(queryUpdateCategoria, parametros);

        return update(categoria);
    }, {
        message: function (e) {
            if (e.message === 'Categoria não pode ser inativada, pois está associada a produtos ativos.') {
                return e.message;
            }
            return 'Erro ao atualizar categoria, verifique os campos e tente novamente';
        }
    });
}
async function getProdutoCategorias(){
    const query = 'select id Value, descricao DisplayText from categoria where status = 1';
    return execute(async function (connection) {
        const [rows] = await connection.query(query);
        return options(rows);
    }, {
        message: function (e) {
            return `Erro ao carregar lista de categorias`;
        }
    });

}

module.exports = { 
    getProdutos,
    criarProduto,
    atualizarProduto, 
    removerProduto,
    getProdutosOptions,
    getCategorias,
    criarCategoria,
    atualizarCategoria,
    getProdutoCategorias
    
};

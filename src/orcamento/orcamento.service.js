
const pool = require('../utils/connection');
const execute = require('../utils/db');
const { list, create, update, options, remove } = require('../utils/apireturn');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

async function getOrcamento(filtros, pageNumber, pageSize ) {
    let query = `SELECT o.idorcamento,
                        o.codagenda,
                        o.codusuario,
                        date_format(o.datavalidade, '%d/%m/%Y') datavalidade, 
                        date_format(o.datacriacao, '%d/%m/%Y') datacriacao, 
                        o.status,                      
                        ifnull(p.total, 0) total,
                        ifnull(os.id_os, 0) hasos,
                        concat(v.modelo,' - ', v.placa) "agenda"  
                 FROM orcamento o
                 inner join agenda a
                    on a.idagenda = codagenda
                 inner join veiculos v
                    on v.idveiculo  = a.codveiculo
			     left join (
                 select sum(p.valor * p.quantidade) total, 
					codorcamento 
				from orcamento_produtos p 
					group by codorcamento                 
                 ) p
                 on p.codorcamento = o.idorcamento 
                 left join os
                 on os.codorcamento=o.idorcamento  
                 WHERE o.status = ?  `;
    
    let parametros = [filtros.status];
    let conditions = [];    

    if (filtros.veiculo) {
        conditions.push("( lower(v.placa) = ? or  lower(v.modelo) = ? )");
        parametros.push(filtros.veiculo.toString().trim().toLowerCase(), filtros.veiculo.toString().trim().toLowerCase());
    }
    
    if (conditions.length > 0) {
        query += " AND " + conditions.join(" AND ");
    }

    query += " ORDER BY idorcamento LIMIT ?, ?";
   
    parametros.push(pageNumber, pageSize);

    

    return execute(async function (connection) {
        const [rows] = await connection.query(query, parametros);
        const [total] = await connection.execute('SELECT count(*) total FROM orcamento WHERE status = 1;');
        return list(rows, total[0].total);
    }, {
        message: function (e) {
            return `Erro ao carregar lista de orçamentos devido a ${e.message}`;
        }
    });
}

async function getOrcamentobyID(idorcamento) {
    const queryOrcamento = `SELECT 
    o.idorcamento,
       o.codagenda,
       o.codusuario,
       u.nome AS nome_usuario,
       
       DATE_FORMAT(o.datavalidade, '%d/%m/%Y') AS datavalidade,
       DATE_FORMAT(o.datacriacao, '%d/%m/%Y') AS datacriacao,
       o.status,
       IFNULL(p.total, 0) AS total
FROM orcamento o
LEFT JOIN (
    SELECT SUM(p.valor * p.quantidade) AS total, 
           p.codorcamento
    FROM orcamento_produtos p
    GROUP BY p.codorcamento
) p ON p.codorcamento = o.idorcamento
INNER JOIN usuarios u ON o.codusuario = u.idusuarios
WHERE o.idorcamento = ?`;
    
    const queryProdutos = `SELECT 
                                p.codorcamento, 
                                p.codproduto, 
                                p.valor, 
                                p.quantidade, 
                                pr.descricao AS produto_nome
                           FROM orcamento_produtos p
                           JOIN produtos pr ON p.codproduto = pr.idproduto
                           WHERE p.codorcamento = ?
    `;
                                 
            
            
    
    const parametros = [idorcamento];

    return execute(async function (connection) {
        const [orcamentoRows] = await connection.query(queryOrcamento, parametros);
        if (orcamentoRows.length === 0) {
            return null;
        }
        
        const [produtosRows] = await connection.query(queryProdutos, parametros);
        const orcamento = orcamentoRows[0];
        orcamento.produtos = produtosRows;

        

        return orcamento;
    }, {
        message: function (e) {
            return `Erro ao carregar o orçamento devido a ${e.message}`;
        }
    });
}

async function getAgendaByCodAgenda(codagenda) {
    const queryAgenda = `
        SELECT 
            a.idagenda,
            CONCAT(v.modelo, ' - ', v.placa) AS descricao_agenda
        FROM agenda a
        INNER JOIN veiculos v ON v.idveiculo = a.codveiculo
        WHERE a.idagenda = ?
    `;
    const parametros = [codagenda];

    return execute(async function (connection) {
        const [agendaRows] = await connection.query(queryAgenda, parametros);
        if (agendaRows.length === 0) {
            return null;
        }
        return agendaRows[0];
    }, {
        message: function (e) {
            return `Erro ao carregar a agenda devido a ${e.message}`;
        }
    });
}
async function getUsuariodaAgenda(codagenda) {
    const queryAgenda = `
         SELECT 
                a.idagenda,
                v.codcliente,
                a.codveiculo, 
                DATE_FORMAT(a.dataagendamento,'%d/%m/%Y') AS dataagendamento, 
                DATE_FORMAT(a.datacriacao,'%d/%m/%Y') AS datacriacao,
                a.status,
                u.nome AS nome_usuario
            FROM agenda a
            INNER JOIN veiculos v ON v.idveiculo = a.codveiculo
            INNER JOIN usuarios u ON u.idusuarios = v.codcliente
            WHERE a.idagenda = ?
    `;
    const parametros = [codagenda];

    return execute(async function (connection) {
        const [agendaRows] = await connection.query(queryAgenda, parametros);
        if (agendaRows.length === 0) {
            return null;
        }
        return agendaRows[0];
    }, {
        message: function (e) {
            return `Erro ao carregar a agenda devido a ${e.message}`;
        }
    });
}
async function criarOrcamento(orcamento) {
    return execute(async function (connection) { 
        // Consulta para obter a data de agendamento apenas se a agenda estiver com status = 1
        const queryAgenda = `
            SELECT DATE_FORMAT(a.dataagendamento, '%Y-%m-%d') AS dataagendamento
            FROM agenda a
            WHERE a.idagenda = ? AND a.status = 1
        `;
        
        const [result] = await connection.query(queryAgenda, [orcamento.codagenda]);
        
        if (!result || result.length === 0) {
            throw new Error('Agenda não encontrada ou está com status inativo');
        }
        
        const dataAgendamento = result[0].dataagendamento;
        
        // Convertendo a data de validade para o formato do banco de dados (YYYY-MM-DD)
        const dataValidade = moment(orcamento.datavalidade, 'DD/MM/YYYY').format('YYYY-MM-DD');
        
        // Verifica se a data de validade é maior que a data de agendamento
        if (dataValidade <= dataAgendamento) {
            throw new Error('A data de validade deve ser maior que a data de agendamento');
        }
        
        // Se a verificação passou, continua com a inserção do orçamento
        const queryOrcamento = `
            INSERT INTO orcamento (codagenda, codusuario, datavalidade) 
            VALUES (?, ?, ?);            
        `;
        
        const parametros = [orcamento.codagenda, orcamento.usuario, dataValidade];
        
        const orcament = await connection.query(queryOrcamento, parametros); 
        
        orcamento.idorcamento = orcament.insertId;  // Ajustado para obter o ID gerado
        
        return create(orcamento);
    },
    {
        message: function (e) {
            return 'Erro ao cadastrar orçamento, verifique os campos e tente novamente: ' + e.message;
        }
    });
}


async function criarOrdem(connection, orcamento) {
    // Formatação das datas de entrada e previsão
    const dataEntrada = moment(orcamento.datainicio, 'DD/MM/YYYY').format('YYYY-MM-DD');
    const dataPrevisao = moment(orcamento.dataprevisao, 'DD/MM/YYYY').format('YYYY-MM-DD');

    // Consulta para obter a datavalidade do orçamento
    const queryValidade = `
        SELECT DATE_FORMAT(o.datavalidade, '%Y-%m-%d') AS datavalidade
        FROM orcamento o
        WHERE o.idorcamento = ?
    `;
    
    const [resultadoValidade] = await connection.query(queryValidade, [orcamento.idorcamento]);
    
    if (!resultadoValidade || resultadoValidade.length === 0) {
        throw new Error('Orçamento não encontrado');
    }

    const dataValidade = resultadoValidade[0].datavalidade;

    // Verifica se a data de entrada ou previsão são maiores que a data de validade
    if (dataEntrada > dataValidade || dataPrevisao > dataValidade) {
        throw new Error('A data de início ou a data de previsão não podem ser maiores que a data de validade.');
    }

    // Verifica se a data de entrada é menor que a data de previsão
    if (dataEntrada >= dataPrevisao) {
        throw new Error('A data de início deve ser menor que a data de previsão.');
    }

    // Query para inserir a ordem de serviço
    const query = `
        INSERT INTO os (codagenda, codorcamento, dataentrada, dataprevisao, status) 
        VALUES (?, ?, ?, ?, ?)
    `;

    const valores = [
        orcamento.codagenda,
        orcamento.idorcamento,
        dataEntrada,
        dataPrevisao,
        0 // Status inicial da ordem de serviço
    ];

    console.log(valores, orcamento);

    return await connection.query(query, valores);
}

async function atualizarOrcamento(orcamento) {
    return execute(async function (connection) {
        const query = `
            UPDATE orcamento SET    
            codusuario = ?,  
            datavalidade = ?,                  
            status = ?
            WHERE idorcamento = ?        
        `;

        const datavalidade = moment(orcamento.datavalidade, 'DD/MM/YYYY').format('YYYY-MM-DD');
        const parametros = [orcamento.usuario, datavalidade, orcamento.status, orcamento.idorcamento]; 

        console.log(orcamento);

        const orcament = await connection.query(query, parametros); // Executa a query para atualizar o orçamento  

        // Verifica se o orçamento foi aprovado e se não possui ordem de serviço associada
        if (orcamento.status == 1 && orcamento.hasos == 0) { // orçamento aprovado
            const ordem = await criarOrdem(connection, orcamento);      
            console.log(ordem);
        }

        return update(orcamento);
    },
    {
        message: function (e) {
            console.log(e);
            return 'Erro ao atualizar orçamento, verifique as datas de início e previsão.';
        },
        transaction: true
    });
}

async function removerorcamento(id){}


async function getProdutos(orcamento, jtPageSize, pageSize){
    
    let query = `
        SELECT SQL_CALC_FOUND_ROWS op.*, 
       p.descricao AS nomeproduto
  FROM orcamento_produtos op
 INNER JOIN produtos p ON op.codproduto = p.idproduto
 WHERE op.codorcamento = ?
 ORDER BY op.codproduto

 LIMIT ?, ?;
    `;
    return execute(async function (connection) {
        let parametros = [orcamento, jtPageSize, pageSize];        
        const [rows] = await connection.query(query, parametros);
        const [total] = await connection.execute('SELECT FOUND_ROWS() AS total_rows;');
        return list(rows, total[0].total_rows);
    }, {
        message: function (e) {
            return `Erro ao carregar lista de produtos do orçamento devido a ${e.message}`;
        }
    });

}

async function adicionarProduto(produto) {
    
    // Verifica se a quantidade é menor ou igual a 0
    
    if (produto.quantidade <= 0) {
        return {
            Result: 'ERROR',
            Message: 'A quantidade deve ser maior que 0.'
        };
    }
    const query = 'INSERT INTO orcamento_produtos (codorcamento, codproduto, valor, quantidade) VALUES (?, ?, ?, ?)';
    
    return execute(async function (connection) {
        const parametros = [produto.codorcamento, produto.codproduto, produto.valorInicial, produto.quantidade];
        const product = await connection.query(query, parametros);
        
        produto.idproduto = product.insertId;
        return create(produto);
    }, {
        message: function (e) {
            return 'Erro ao cadastrar produto, verifique os campos e tente novamente';
        }
    });
}

async function atualizarProduto(produto) {
    if (produto.quantidade <= 0) {
        return {
            Result: 'ERROR',
            Message: 'A quantidade deve ser maior que 0.'
        };
    }
    const query = `
        UPDATE orcamento_produtos SET
        codproduto   = ? ,     
        quantidade = ?,
        valor =?
        WHERE id = ?        
    `;
    console.log(produto)
    return execute(async function (connection) {
        const parametros = [produto.codproduto,produto.quantidade, produto.valorInicial,produto.id];
        const product = await connection.query(query, parametros);
        return update(produto);
    }, {
        message: function (e) {
            return 'Erro ao atualizar produto do orçamento, verifique os campos e tente novamente', e;
        }
    });
}

async function deleteProduto(id) {
    const query = 'DELETE FROM orcamento_produtos WHERE id = ?';
    return execute(async function (connection) {
        await connection.query(query, [id]);
        return remove();
    }, {
        message: function (e) {
            return 'Erro ao excluir produto do orçamento devido a ' + e.message;
        }
    });
}

async function exportarOrcamentoParaPDF(idorcamento, res) {
    try {
        
        const orcamento = await getOrcamentobyID(idorcamento);
        const agenda = await getAgendaByCodAgenda(orcamento.codagenda);
        const usuarioDaAgenda = await getUsuariodaAgenda(agenda.idagenda);
        const nomeUsuario = usuarioDaAgenda.nome_usuario;
        if (!orcamento) {
            throw new Error('Orçamento não encontrado');
        }

        console.log('Dados do orçamento:', orcamento); // Adicione este log para verificar os dados

        const doc = new PDFDocument({ margin: 50 });
        let pdfPath = path.join(__dirname, `orcamento_${idorcamento}.pdf`);
        let writeStream = fs.createWriteStream(pdfPath);

        doc.pipe(writeStream);

        // Cabeçalho
        doc.fontSize(20).text('SGO', 50, 50, { align: 'left' });
        const imagePath = path.join("C:/TCC/public/imgs/logobranco.png"); // Substitua pelo caminho da sua imagem
        doc.image(imagePath, 500, 50, { width: 100 });
        // doc.fontSize(10).text(`Nº ${orcamento.id}`, 500, 50, { align: 'right' });

        // Informações da fatura
        doc.fontSize(12).text(`Código da agenda: ${agenda.descricao_agenda}`, 50, 100, { align: 'left' });
        doc.text(`Nome do Usuário: ${nomeUsuario}`);
       // doc.text(`Nome do cliente: ${orcamento.nome_usuario}`, { align: 'left' });
        doc.text(`Data de criação: ${orcamento.datacriacao}`, { align: 'left' });
        doc.text(`Data de validade: ${orcamento.datavalidade}`, { align: 'left' });
        doc.text(`Total: R$${orcamento.total}`, { align: 'left' });

        // Tabela de itens
        const tableTop = 220;
        const descriptionX = 50;
        const qtyX = 300;
        const unitX = 370;
        const totalX = 450;
        const rowHeight = 25;
        const padding = 10;

        // Cabeçalho da tabela com fundo preto e texto branco
        doc.fillColor('black').rect(50, tableTop - 5, 500, 20).fill();
doc.fillColor('white');
doc.fontSize(10).text('Descrição', descriptionX + padding, tableTop, { align: 'left' });
doc.text('Quantidade', qtyX + padding, tableTop, { align: 'left' });
doc.text('Valor unitário', unitX + padding, tableTop, { align: 'left' });
doc.text('Valor total', totalX + padding, tableTop, { align: 'left' });

        // Linhas verticais separadoras
        doc.moveTo(descriptionX + 250, tableTop - 5).lineTo(descriptionX + 250, tableTop + 15 + orcamento.produtos.length * (rowHeight + 10)).stroke();
        doc.moveTo(qtyX + 65, tableTop - 5).lineTo(qtyX + 65, tableTop + 15 + orcamento.produtos.length * (rowHeight + 10)).stroke();
        doc.moveTo(unitX + 80, tableTop - 5).lineTo(unitX + 80, tableTop + 15 + orcamento.produtos.length * (rowHeight + 10)).stroke();

        // Linha separadora horizontal
        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        let y = tableTop + 25;

        orcamento.produtos.forEach(produto => {
            doc.fillColor('black');
            doc.fontSize(10)
                .text(produto.produto_nome, descriptionX + padding, y, { width: 250 - 2 * padding, align: 'left' })
                .text(produto.quantidade, qtyX + padding, y, { width: 50 - 2 * padding, align: 'right' })
                .text(`R$${produto.valor}`, unitX + padding, y, { width: 60 - 2 * padding, align: 'right' })
                .text(`R$${produto.valor * produto.quantidade}`, totalX + padding, y, { width: 60 - 2 * padding, align: 'right' });

            y += rowHeight;

            // Linha separadora para cada item
            doc.moveTo(50, y).lineTo(550, y).stroke();
            y += 10;
        });

        // Subtotal, tax, and total
        y += 20;
        doc.fontSize(10).font('Helvetica-Bold').text('Subtotal', 300, y);
        doc.text(`R$${orcamento.total}`, totalX, y);

        y += 15;
        doc.text('Taxa', 300, y);
        doc.text('0%', totalX, y);

        y += 15;
        doc.text('Valor total do Orçamento', 300, y);
        doc.text(`R$${orcamento.total}`, totalX, y);

        // Borda final incluindo o total
        doc.rect(50, tableTop - 5, 500, y - tableTop + 40).stroke();

        // Rodapé
        y += 50;
        doc.fontSize(8).text('Privacidade', 50, y);
        doc.text('A sua privacidade e segurança são extremamente importantes para nós. Nós nos comprometemos a proteger todas as informações pessoais que você nos fornece. Todos os dados coletados são armazenados de forma segura e são utilizados exclusivamente para os fins para os quais foram coletados.', 50, y + 15);

        doc.end();

        writeStream.on('finish', function () {
            res.download(pdfPath, `orcamento_${idorcamento}.pdf`, function (err) {
                if (err) {
                    console.error(`Erro ao fazer download do PDF: ${err.message}`);
                }
                fs.unlinkSync(pdfPath);
            });
        });

    } catch (error) {
        console.error(`Erro ao exportar orçamento para PDF: ${error.message}`);
        res.status(500).json({ message: `Erro ao exportar orçamento para PDF: ${error.message}` });
    }
}

// orcamento.service.js
async function getOrcamentoStatus() {
    const query = `
        SELECT 
            status, 
            COUNT(*) AS count
        FROM orcamento
        GROUP BY status;
    `;
    
    return execute(async function (connection) {
        const [rows] = await connection.query(query);
        
        const total = rows.reduce((sum, row) => sum + row.count, 0);
        const statusMap = {
            0: 'Aguardando Aprovação',
            1: 'Aprovado',
            2: 'Reprovado' // Caso haja um status 2 para pendente
        };

        const percentages = rows.map(row => ({
            status: statusMap[row.status],  // Mapeia status numérico para texto
            percentage: ((row.count / total) * 100).toFixed(2)
        }));

        return percentages;
    }, {
        message: function (e) {
            return `Erro ao carregar status de orçamentos: ${e.message}`;
        }
    });
}

async function getProdutosMaisUtilizados() {
    const query = `
    SELECT 
        p.idproduto,
        p.descricao AS nome_produto, 
        SUM(op.quantidade) AS total_utilizado
    FROM orcamento_produtos op
    INNER JOIN os o ON o.codorcamento = op.codorcamento
    INNER JOIN produtos p ON p.idproduto = op.codproduto
    
    GROUP BY p.idproduto, p.descricao
    ORDER BY total_utilizado DESC;
`;

return execute(async function (connection) {
    const [rows] = await connection.query(query);
    return rows;
}, {
    message: function (e) {
        return `Erro ao carregar os produtos mais utilizados: ${e.message}`;
    }
});
}

async function getProdutosMaisCaros() {
    const query = `
        SELECT 
            p.descricao,
            op.valor
        FROM orcamento_produtos op
        INNER JOIN produtos p ON p.idproduto = op.codproduto
        INNER JOIN orcamento o ON o.idorcamento = op.codorcamento
        WHERE o.status = 1  -- Considerando que 'aprovado' seja o status dos orçamentos aprovados
        ORDER BY op.valor DESC
        LIMIT 10;  -- Ajuste o limite conforme necessário
    `;

    return execute(async function (connection) {
        const [rows] = await connection.query(query);
        return rows;
    }, {
        message: function (e) {
            return `Erro ao carregar os produtos mais caros dos orçamentos aprovados: ${e.message}`;
        }
    });
}
async function getdataeorcamento() {
    const query = `
        SELECT 
    date_format(o.datacriacao, '%d/%m/%Y') as criacao_dia, 
    COUNT(*) AS total_orcamento
FROM orcamento o 
GROUP BY criacao_dia
ORDER BY criacao_dia;
    `;

    return execute(async function (connection) {
        const [rows] = await connection.query(query ); // Você pode definir o 'status' na chamada da função
        return rows;
    }, {
        message: function (e) {
            return `Erro ao carregar os executantes: ${e.message}`;
        }
    });
}
module.exports = { 
    getOrcamento,
    getOrcamentobyID, 
    criarOrcamento,
    atualizarOrcamento, 
    getdataeorcamento,
    getProdutos,
    adicionarProduto,
    atualizarProduto,
    deleteProduto,
    getOrcamentoStatus,
    getAgendaByCodAgenda,
    getUsuariodaAgenda,
    getProdutosMaisCaros,
    getProdutosMaisUtilizados,
    exportarOrcamentoParaPDF
}
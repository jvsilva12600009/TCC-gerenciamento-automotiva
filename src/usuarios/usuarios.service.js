const pool = require('../utils/connection');
const execute = require('../utils/db');
const { list, create, update, options } = require('../utils/apireturn');
const bcrypt = require('bcrypt');
const { param } = require('jquery');

async function getUsuarioByEmail(email) {
    const query = 'SELECT * FROM usuarios WHERE email = ?';
    return execute(async function (connection) {
        const [rows] = await connection.query(query, [email]);

        if (rows.length > 0) {
            return rows[0];
        }
        return null;
    }, {
        message: function (e) {
            return `Erro ao carregar usuarios devido a ${e.message}`;
        }
    });
}
//SELECT SQL_CALC_FOUND_ROWS * FROM usuarios where status =?`;
async function getUsuarios(filtros, pageNumber, pageSize) {
    let query = `SELECT idusuarios, nome, cpf, status, telefone, endereco, tipousuario, email, senha 
                 FROM usuarios 
                 WHERE status = ? `;
    let parametros = [filtros.status];
    let conditions = [];

    if (filtros.cliente) {
        conditions.push("lower(nome) LIKE CONCAT('%', ?, '%')");
        parametros.push(filtros.cliente.toString().trim().toLowerCase());
    }

    if (filtros.cpf) {
        conditions.push("cpf LIKE CONCAT('%', ?, '%')");
        parametros.push(filtros.cpf.toString().trim());
    }

    if (filtros.tipo != -1) {
        conditions.push("tipousuario = ?");
        parametros.push(filtros.tipo);
    }

    if (conditions.length > 0) {
        query += " AND " + conditions.join(" AND ");
    }

    query += " ORDER BY idusuarios LIMIT ?, ?";

    parametros.push(pageNumber, pageSize);

    return execute(async function (connection) {
        const [rows] = await connection.query(query, parametros);
        const [total] = await connection.execute('SELECT count(*) total FROM usuarios WHERE status = 1;');
        return list(rows, total[0].total);
    }, {
        message: function (e) {
            return `Erro ao carregar lista de usuários devido a ${e.message}`;
        }
    });
}

async function criarUsuario(usuario) {
    const query = `
        INSERT INTO usuarios (nome, email, senha, endereco, cpf, telefone, tipousuario) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    return execute(async function (connection) {
        const senha = await hashPassword(usuario.senha);
        const values = [usuario.nome, usuario.email, senha, usuario.endereco, usuario.cpf, usuario.telefone, usuario.tipousuario ];
        const user = await connection.query(query, values);
        usuario.idusuarios = user.id;
        delete usuario.senha;
        return create(usuario);
    }, {
        message: function (e) {
            return 'Erro ao cadastrar usuário, verifique os campos e tente novamente ' + e;
        }
    });
}

async function atualizarUsuario(usuario) {
    return execute(async function (connection) {
        // Verificar se o usuário é técnico e está tentando ser inativado
        

        // Verificar se o usuário possui veículo com status ativo
        if (usuario.status == 0) {
            const queryVeiculosAtivos = `
                SELECT v.idveiculo
                FROM veiculos v
                WHERE v.codcliente = ? AND v.status = 1
            `;

            // Executa a consulta para verificar veículos ativos
            const [veiculosAtivos] = await connection.query(queryVeiculosAtivos, [usuario.idusuarios]);

            // Se existir um veículo ativo, bloquear a inativação (usuario.status = 0)
            if (veiculosAtivos.length > 0) {
                throw new Error('O usuário não pode ser inativado, pois possui veículos com status ativo.');
            }
        }

        // Atualizar o usuário se não houver ordens abertas ou veículos ativos
        const queryUpdateUsuario = `
            UPDATE usuarios SET 
            nome = ?, 
            email = ?, 
            endereco = ?, 
            cpf = ?, 
            telefone = ?,
            tipousuario = ?,
            status = ?
            WHERE idusuarios = ?
        `;
        const parametros = [
            usuario.nome,
            usuario.email,
            usuario.endereco,
            usuario.cpf,
            usuario.telefone,
            usuario.tipousuario,
            usuario.status,
            usuario.idusuarios
        ];

        await connection.query(queryUpdateUsuario, parametros);

        return update(usuario);
    }, {
        message: function (e) {
            if (e.message === 'O técnico não pode ser inativado, pois possui ordens de serviço em aberto.' || 
                e.message === 'O usuário não pode ser inativado, pois possui veículos com status ativo.') {
                return e.message;
            }
            return 'Erro ao atualizar usuário, verifique os campos e tente novamente.';
        }
    });
}

async function removerUsuario(id) {
    const query = 'DELETE FROM usuarios WHERE idusuarios = ?';
    return execute(async function (connection) {
        await connection.query(query, [id]);
    }, {
        message: function (e) {
            return 'Erro ao excluir usuário devido a ' + e.message;
        }
    });
}

async function getUsuariosByTipo(tipo) {
    const query = `
        SELECT idusuarios "Value", nome "DisplayText" 
        FROM usuarios 
        WHERE tipousuario = ? AND status = 1
        ORDER BY nome
    `;

    return execute(async function (connection) {
        const [rows] = await connection.query(query, [tipo]);
        return options(rows);
    }, {
        message: function (e) {
            return `Erro ao carregar lista de clientes`;
        }
    });
}

async function hashPassword(senha) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(senha, saltRounds);
    return hashedPassword;
}

async function validateSenha(plain, encrypted) {
    const match = await bcrypt.compare(plain, encrypted);
    return match;
}

module.exports = {
    getUsuarioByEmail,
    getUsuarios,
    getUsuariosByTipo,
    criarUsuario,
    atualizarUsuario,
    removerUsuario,
    validateSenha
};
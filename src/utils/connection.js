
const mysql = require('mysql2/promise');


let DBConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'SGO',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    enableKeepAlive: true,
    keepAliveInitialDelay: 0

  };
    
  const pool = mysql.createPool(DBConfig);
   
  module.exports = pool;
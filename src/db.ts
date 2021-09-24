import * as mysql from 'mysql2';

const dbPool = mysql.createPool({
    host: process.env.DBCONFIG_HOST,
    user: process.env.DBCONFIG_USER,
    password: process.env.DBCONFIG_PASSWORD,
    database: process.env.DBCONFIG_DB,

})

const getDbConnection = (callback: (err: NodeJS.ErrnoException, connection: mysql.PoolConnection) => any) => {
    dbPool.getConnection((err, connection) => {
        callback(err, connection)
    })
}

export default getDbConnection
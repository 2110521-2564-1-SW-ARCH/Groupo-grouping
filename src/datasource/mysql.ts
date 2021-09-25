import {Connection, createConnection} from "typeorm";

let connection: Connection | null = null;

export const getConnection = async (): Promise<Connection> => {
    if (connection === null) {
        connection = await createConnection({
            type: "mysql",
            host: process.env.MYSQL_HOST,
            port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
            username: process.env.MYSQL_USER || "root",
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB,
            entities: [__dirname + "/../models/*.ts"],
            synchronize: true,
            logging: false,
        })
        console.log(`connect to database successfully (host=${process.env.MYSQL_HOST})`)
    }
    return connection;
}

// pg-client.js
import pg from 'pg';
const { Pool } = pg;

class dba {
    /**
     * Создает экземпляр клиента PostgreSQL
     * @param {Object} config - Конфигурация подключения к БД
     * @param {string} config.user - Пользователь БД
     * @param {string} config.host - Хост БД
     * @param {string} config.database - Имя БД
     * @param {string} config.password - Пароль
     * @param {number} config.port - Порт
     * @param {number} [config.max=10] - Максимальное количество клиентов в пуле
     * @param {number} [config.idleTimeoutMillis=30000] - Время простаивания клиента
     * @param {number} [config.connectionTimeoutMillis=2000] - Таймаут подключения
     */
    constructor(config) {
        const sslConfig = config.ssl ? {
            ssl: {
                rejectUnauthorized: true,
                ...config.sslOptions
            }
        } : {};



        this.pool = new Pool({
            user: config.user,
            host: config.host,
            database: config.database,
            password: config.password,
            port: config.port,
            max: config.max || 10,
            idleTimeoutMillis: config.idleTimeoutMillis || 30000,
            connectionTimeoutMillis: config.connectionTimeoutMillis || 2000,
            ...sslConfig
        });

        // Обработка ошибок пула
        this.pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
        });
    }

    /**
     * Выполняет SQL запрос и возвращает все строки результата
     * @param {string} sql - SQL запрос
     * @param {Array} [params=[]] - Параметры запроса
     * @returns {Promise<Array>} - Массив строк результата
     */
    async query(sql, params = []) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(sql, params);
            return result.rows;
        } catch (err) {
            console.error('Error executing query:', err);
            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * Выполняет SQL запрос и возвращает первую строку результата
     * @param {string} sql - SQL запрос
     * @param {Array} [params=[]] - Параметры запроса
     * @returns {Promise<Object|null>} - Первая строка результата или null
     */
    async queryRow(sql, params = []) {
        const rows = await this.query(sql, params);
        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Выполняет SQL запрос и возвращает скалярное значение (первое поле первой строки)
     * @param {string} sql - SQL запрос
     * @param {Array} [params=[]] - Параметры запроса
     * @returns {Promise<*>} - Скалярное значение
     */
    async queryScalar(sql, params = []) {
        const row = await this.queryRow(sql, params);
        if (!row) return null;
        
        const keys = Object.keys(row);
        return keys.length > 0 ? row[keys[0]] : null;
    }

    /**
     * Выполняет SQL команду (INSERT, UPDATE, DELETE и т.д.)
     * @param {string} sql - SQL команда
     * @param {Array} [params=[]] - Параметры команды
     * @returns {Promise<number>} - Количество затронутых строк
     */
    async execute(sql, params = []) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(sql, params);
            return result.rowCount;
        } catch (err) {
            console.error('Error executing command:', err);
            throw err;
        } finally {
            client.release();
        }
    }

    /**
     * Закрывает все соединения пула
     * @returns {Promise<void>}
     */
    async close() {
        await this.pool.end();
    }
}

export default dba;
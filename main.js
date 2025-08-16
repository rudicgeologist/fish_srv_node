// const express = require('express');
import express from 'express';
const app = express();
// const cors = require('cors'); 
import cors from 'cors'
import dba from './db_adapter.js';

// const dba = require('./db_adapter.js');


const PORT = process.env.PORT || 5000;

// Конфигурация подключения
const config = {
    user: 'deadnikifor',
    host: 'ep-cold-night-344467.eu-central-1.aws.neon.tech',
    database: 'neondb',
    password: 'WcfJxVw2iu7P',
    // port: 5432,
    ssl: true,
    sslOptions: {
        rejectUnauthorized: false // Для самоподписанных сертификатов
    }
};

async function get_fising_places(p_type, p_basesOnly) {
    const db = new dba(config);

    try {
        // Получение табличных данных
        const fishingplaces = await db.query(`select * from get_places(${p_type}, ${p_basesOnly});`);     //WHERE is_base = $1', [true]
        // console.log('Bases: \n', fishingplaces);
        return fishingplaces;

        // // Получение одной строки
        // const user = await db.queryRow('SELECT * FROM users WHERE id = $1', [1]);
        // console.log('User with ID 1:', user);

        // // Получение скалярного значения
        // const count = await db.queryScalar('SELECT COUNT(*) FROM users');
        // console.log('Total users:', count);

        // // Выполнение команды
        // const affected = await db.execute(
        //     'UPDATE users SET last_login = NOW() WHERE id = $1',
        //     [1]
        // );
        // console.log('Updated rows:', affected);
    } catch (err) {
        console.error('Database error:', err);
    } finally {
        await db.close();
    }
}


app.use(cors());

app.get('/api/data', async (req, res) => {
  // const data = [
  //   { id: 1, name: 'John Doe' },
  //   { id: 2, name: 'Jane Smith' },
  //   // Add more data as needed
  // ];
    const p_type = req.query.type;
    const p_basesOnly = req.query.basesOnly;

    const data = await get_fising_places(p_type, p_basesOnly);
    console.log('data: ');
    // console.log(data);

  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
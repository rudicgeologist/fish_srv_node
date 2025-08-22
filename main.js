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

async function add_place(
  p_name, p_lant, p_long, p_description, p_is_base,
  p_car_accessibility, p_bus_accessibility, p_user_id
) 
{
  const db = new dba(config);

  try {
    // console.log(`select * from  public.fa_add_place('${p_name}', ${p_lant}, ${p_long}, '${p_description}', ${p_is_base}, ${p_car_accessibility}, ${p_bus_accessibility}, ${p_user_id});`);

    const new_place_id = await db.queryScalar(
      `select * from  public.fa_add_place('
        ${p_name}', ${p_lant}, ${p_long}, '${p_description}', ${p_is_base}, 
        ${p_car_accessibility}, ${p_bus_accessibility}, ${p_user_id});
      `
    );
    console.log('Total new_place_id:', new_place_id);
    return new_place_id;

  } catch (err) {
    console.error('Database error:', err);
  } finally {
    await db.close();
  }
}

app.use(cors());

app.get('/api/get_map_data', async (req, res) => {
    const p_type = req.query.type;
    const p_basesOnly = req.query.basesOnly;

    const data = await get_fising_places(p_type, p_basesOnly);
    console.log('data: ');
    // console.log(data);

  res.json(data);
});


// http://localhost:5000/api/add_place&_name=yp1&lant%20=51.3&long=65.2&description=description1&is_base=true&car_accessibility=false&bus_accessibility=true&user_id=777
app.get('/api/add_place', async (req, res) => {
    const p_name = req.query._name;
    const p_lant = req.query.lant;
    const p_long = req.query.long;
    const p_description = req.query.description;
    const p_is_base = req.query.is_base;
    const p_car_accessibility = req.query.car_accessibility;
    const p_bus_accessibility = req.query.bus_accessibility;
    const p_user_id = req.query.user_id; 

    const data = await add_place(
      p_name,
      p_lant,
      p_long,
      p_description,
      p_is_base,
      p_car_accessibility,
      p_bus_accessibility,
      p_user_id,
    );
    console.log('add_place: ');
    console.log(data);

  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
//ESTE BLOQUE NO ESTÁ EN EL CURSO; IMPORTANMTE SI NO NO FUNCIONAN BIEN LAS VARIABLES DE ENTORNO
import { config } from 'dotenv';
import Sequelize from 'sequelize';
// dotenv.config({path:'.env'});
config();
//ESTE BLOQUE NO ESTÁ EN EL CURSO; IMPORTANMTE SI NO NO FUNCIONAN BIEN LAS VARIABLES DE ENTORNO
const db = new Sequelize (process.env.BD_NOMBRE,process.env.BD_USER,process.env.BD_PASSWORD ?? '',{
    host:process.env.BD_HOST,
    port:process.env.BD_PORT,
    dialect:process.env.BD_DIALECT,
    define: {
        timestamps:true
    },
    pool: {
        max:5,
        min:0,
        acquiere:30000,
        idle:10000
    },
    operatorAliases:false
});
export default db;
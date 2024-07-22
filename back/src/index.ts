import server from "./server";
import { PORT } from "./config/envs";
import "reflect-metadata"
import { AppDataSource } from "./config/data-source";
import dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' })

AppDataSource.initialize()
.then(res=>{
    server.listen(PORT, () => {
        console.log(`Servidor iniciado correctamente en el puerto ${PORT}`);
      });
      
    });


import dotenv from 'dotenv';
dotenv.config();
import {Sequelize,DataTypes,Op} from 'sequelize';

const connection = new Sequelize(process.env.CONNECTION_STRING,{
    dialect:'postgres',
    port:5432
});

 ( async()=>{
   try {
         connection.authenticate().then(()=>{
        console.log("Supabase Connected");        
    })

    // await connection.sync({alter:true})
    
    


   } catch (error) {

    console.error('❌ Unable to connect to the database:', error);
    
   }
})();

export {connection,DataTypes,Op};

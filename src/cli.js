#!/usr/bin/env node
import { Command } from 'commander';
import {gen,onboard,findMinerList,deleteMiner} from "./index.js"
import {startPm2,stopPm2,showLogs} from "./pm2.js"
import moment from 'moment';
import fs from "fs";

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import * as dotenv from "dotenv";



const program = new Command();


program
    .command('network <name>')
    .description('Configure the network')
    .action(async (name) => {

        let msg="";
        if(name!=="testnet" && name!=="mainnet"){
            msg=" The network option must be one of these two values: testnet or mainnet.";
        }else{
            const envPath = path.join(__dirname, '../.env');

            const envConfig = dotenv.parse(fs.readFileSync(envPath))
            envConfig["ACTIVE"] = name;

            const newEnvConfig = Object.entries(envConfig).map(([key, value]) => `${key}=${value}`).join('\n');
            fs.writeFileSync(envPath, newEnvConfig);

            msg="Current Network: "+name;
        }



        const content = `
--------------------------Information--------------------------------------

                ${msg}

---------------------------------------------------------------------------------
Help:
    miner gen       : game-cli gen --power 10 
    miner onboard   : game-cli onboard 0xffebb372c8a19b828e442f37a79ec22f72c8de09
    miner list      : game-cli ls
     
      `;
        console.log(content);
    });

program
    .command('gen')
    .description('Create a miner with a specified rated power; the default rated power is 10kW.')
    .option('-p, --power <power>', 'Rated power, unit kW, default value is 10kW.')
    .action(async (options) => {
        const miner=await gen(options);
        const content = `
--------------------------Information--------------------------------------

                minerAddress: ${miner.minerAddress}
      
      
Note: The miner address above needs to be provided to the administrator, who will then register this address in the platform before onboard operations can be performed.

---------------------------------------------------------------------------------
Help:
    miner onboard   : game-cli onboard 0xffebb372c8a19b828e442f37a79ec22f72c8de09
    miner list      : game-cli ls  
    delete  miner   : game-cli delete 0xffebb372c8a19b828e442f37a79ec22f72c8de09 
     
      `;
        console.log(content);
    });

program
    .command('ls')
    .description('Display all miner information in a table.')
    .action(async () => {
        await ls();
        const content = `
Help:
    miner onboard   : game-cli onboard 0xffebb372c8a19b828e442f37a79ec22f72c8de09
    miner gen       : game-cli gen --power 10 
    delete  miner   : game-cli delete 0xffebb372c8a19b828e442f37a79ec22f72c8de09 
          `;
        console.log(content);
    });

program
    .command('delete <minerAddress>')
    .description('Delete a miner using the miner address.')
    .action(async (minerAddress) => {
        await deleteMiner(minerAddress);
        await ls();
        const content = `
Help:
    miner onboard   : game-cli onboard 0xffebb372c8a19b828e442f37a79ec22f72c8de09
    miner gen       : game-cli gen --power 10 
    miner list      : game-cli ls
      `;
        console.log(content);
    });

program
    .command('onboard <minerAddress> <ownerAddress>')
    .description('miner onboard')
    .action(async (minerAddress,ownerAddress) => {
        try {
            await onboard(minerAddress,ownerAddress);
            await ls();
        }catch (e){
          const  errorMsg=`
        ${e.toString()}
            `
            console.log(errorMsg)
        }


        const content = `
Help:
     miner gen      : game-cli gen --power 10
     miner list     : game-cli ls 
     delete miner   : game-cli delete 0xffebb372c8a19b828e442f37a79ec22f72c8de09 
      `;
        console.log(content);
    });


program
    .command('start')
    .description('miner start')
    .action(async (minerAddress,ownerAddress) => {
        try {
             startPm2();
        }catch (e){
            const  errorMsg=`
        ${e.toString()}
            `
            console.log(e)
        }
    });


program
    .command('stop')
    .description('miner stop')
    .action(async (minerAddress,ownerAddress) => {
        try {
            stopPm2();
        }catch (e){
            const  errorMsg=`
        ${e.toString()}
            `
            console.log(errorMsg)
        }
    });

program
    .command('logs')
    .description('miner logs')
    .action(async (minerAddress,ownerAddress) => {
        try {
            showLogs();
        }catch (e){
            const  errorMsg=`
        ${e.toString()}
            `
            console.log(errorMsg)
        }
    });

program.parse(process.argv);


async function ls() {
    const  list =await findMinerList();

    const listTmep=[];
    list.forEach(miner=>{
        const createTime = moment.unix(miner.createTime/1000).format('YYYY-MM-DD HH:mm:ss');
        const item={"minerAddress":miner.minerAddress,"status":miner.status,networkType:miner.networkType,"createTime":createTime};
        listTmep.push(item);
    })
    console.table(listTmep)
}






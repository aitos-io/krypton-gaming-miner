import {all, deleteItem, get, insert, update} from "./db.js"
import {ethers} from 'ethers';

import axios from 'axios';
import * as dotenv from "dotenv";

import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const envPath = path.join(__dirname, '../.env');
dotenv.config({path:envPath});

export async function gen(options) {
    const active = process.env.ACTIVE;

    const wallet =await genWallet();

    const ratedPower= options.ratedPower?options.ratedPower*1000*1000:10000000;

    const miner={
        privateKey:wallet.privateKey.toLowerCase(),
        publicKey:wallet.publicKey.toLowerCase(),
        minerAddress:wallet.address.toLowerCase(),
        minerType:1,
        status:1,
        ratedPower:ratedPower,
        networkType:active,
        createTime:new Date().getTime()
    }
    await insert("insert into miners(privateKey,publicKey,minerAddress,minerType,status,ratedPower,networkType,createTime) values (?, ?,?, ?,?, ?,?,?)",
        [
            miner.privateKey,miner.publicKey,miner.minerAddress,miner.minerType,miner.status,miner.ratedPower,miner.networkType,miner.createTime
        ]
    );
    return miner;
}

export async function findMinerList() {
    const active = process.env.ACTIVE;

    return await all("SELECT * FROM miners where networkType=? order by createTime", active);
}

export async function onboard(minerAddress,ownerAddress) {
    const active = process.env.ACTIVE;
    let networkUrl="";
    if(active==="testnet"){
        networkUrl=process.env.TESTNET_URL;
    }else{
        networkUrl=process.env.TESTNET_URL;
    }

    const miner =await get("SELECT * FROM miners where networkType=? and minerAddress=?",[active,minerAddress]);
    if(!miner){
        throw Error(`The miner with address ${minerAddress} does not exist.`)
    }else if(miner.status===2){
        throw Error(`The miner with address ${minerAddress} has already been onboarded and cannot be repeated.`)
    }


    const latitude = (Math.random() * (-90 - 90) + 90).toFixed(6) * 1;
    const longitude = (Math.random() * (-180 - 180) + 180).toFixed(6) * 1;

    const params={
        "minerAddress": minerAddress,
        "ownerAddress": ownerAddress,
        "metrics": {
            "latitude": latitude+"",
            "longitude": longitude+""
        }
    };

    const wallet = new ethers.Wallet(miner.privateKey);

    const hash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(params)));

    const signature = wallet.signingKey.sign(hash).serialized;

    params["signature"]=ethers.encodeBase58(signature)


    const data = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "kr_miner_onboard",
        "params": params
    }

    console.log(JSON.stringify(data))

    try {

        const response = await axios.post(networkUrl + "/v1", data)
        console.log(JSON.stringify(response.data))
        if (response.data&&!response.data.error) {
            await update("update miners set status=2 , onboardTime=? where minerAddress=?", [new Date(), minerAddress])
        }else if(response.data.error.code===3005){
            throw Error(`The miner (${minerAddress}) does not exist in the network. Please send the address to the administrator for registration.`)
        }
    }catch (error) {
       throw error;
    }
}

export async function deleteMiner(minerAddress) {
    await deleteItem("DELETE FROM miners where minerAddress=?",minerAddress);
}

async function genWallet(){
    return ethers.Wallet.createRandom();
}

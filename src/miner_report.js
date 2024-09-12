import {all, update} from "./db.js"
import {ethers} from 'ethers';

import axios from 'axios';
import * as dotenv from "dotenv";
import schedule from "node-schedule";

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const envPath = path.join(__dirname, '../.env');
dotenv.config({path:envPath});

function simulatePowerOutput(hour, ratedPower) {
    const sunrise = 6; // 日出时间
    const sunset = 18; // 日落时间
    const peakHour = 12; // 中午12点
    const maxPower = ratedPower; // 最大功率100W = 100,000 mW
    const standardDeviation = 2.5; // 标准差，用于控制曲线宽度

    if (hour < sunrise || hour > sunset) {
        // 日落后或日出前功率为0
        return 0;
    } else {
        const timeFromPeak = Math.abs(hour - peakHour);
        let power = maxPower * Math.exp(-0.5 * Math.pow(timeFromPeak / standardDeviation, 2)) /
            (standardDeviation * Math.sqrt(2 * Math.PI));
        power = Math.abs(power);
        // 将功率值转换为毫瓦，并取整
        return Math.round(power);
    }
}


async function genData(){
    console.log("data report!")

    const active = process.env.ACTIVE;

    const list =await all("SELECT * FROM miners where networkType=? and status=2 order by createTime",active);
    for (const miner of list) {
        const power = simulatePowerOutput(new Date().getHours(),miner.ratedPower);
        const totalEnergy=(miner.totalEnergy==null?0:miner.totalEnergy)+power;
        const seconds = Math.floor(new Date().getTime() / 1000);

        const params={
            "minerAddress": miner.minerAddress,
            "eventTime": seconds,
            "metrics": {
                "power": power,
                "totalEnergy": totalEnergy
            }
        }

        const wallet = new ethers.Wallet(miner.privateKey);
        const hash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(params)));

        const signature = wallet.signingKey.sign(hash).serialized;
        params["signature"]=ethers.encodeBase58(signature)
        await sendReportData(params);

        await update("update miners set totalEnergy=? where minerAddress=?", [totalEnergy, miner.minerAddress])
    }
}

async function sendReportData(params){
    let networkUrl="";
    const active = process.env.ACTIVE;
    if(active==="testnet"){
        networkUrl=process.env.TESTNET_URL;
    }else{
        networkUrl=process.env.TESTNET_URL;
    }

    const data = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "kr_reportData",
        "params": params
    }
    console.log(JSON.stringify(data))
    try {

        const response = await axios.post(networkUrl + "/v1", data)
        console.log(JSON.stringify(response.data))
        if (response.data&&!response.data.error) {

        }else if(response.data.error.code===3005){
            throw Error(`The miner does not exist in the network. Please send the address to the administrator for registration.`)
        }
    }catch (error) {
        throw error;
    }
}

schedule.scheduleJob('0 15 0/1 * * ? ',async () => {
    await genData()
});


import pm2 from 'pm2';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { Tail } from 'tail';

const filePath = path.join(__dirname, '../src/miner_report.js');

export function startPm2(){
    pm2.connect((err) => {
        if (err) {
            console.error(err);
            process.exit(2);
        }

        pm2.start({
            script: filePath, // 启动的脚本路径
            name: 'miner-report',       // 应用名称
            exec_mode: 'fork',    // 启动模式，可以是 'fork' 或 'cluster'
            instances: 1,         // 实例数量
            max_memory_restart: '100M', // 内存占用超过 100M 时重启
            log_date_format: 'YYYY-MM-DD HH:mm:ss'
        }, (err, apps) => {
            pm2.disconnect();   // 断开与 PM2 的连接

            if (err) console.log(err);
            const content = `
--------------------------Information--------------------------------------

                ${apps[0].name}  start success !
                
---------------------------------------------------------------------------------
Help:
     miner onboard : game-cli stop 
     查看日志        : game-cli log
     查看miner list : game-cli ls  
     
      `;
            console.log(content);

        });
    });
}

export function stopPm2(){
    pm2.connect((err) => {
        if (err) {
            console.error(err);
            process.exit(2);
        }

        pm2.stop('miner-report', (err, apps) => {
            pm2.disconnect();   // 断开与 PM2 的连接

            if (err) console.log(err);

            const content = `
--------------------------Information--------------------------------------

                ${apps[0].name}  stop success !
                
---------------------------------------------------------------------------------
Help:
     miner onboard : game-cli start 
     查看日志        : game-cli log
     查看miner list : game-cli ls  
     
      `;
            console.log(content);

        });
    });
}


export function showLogs(){
    pm2.connect((err) => {
        if (err) {
            console.error(err);
            process.exit(2);
        }

        pm2.describe('miner-report', (err, processDescription) => {
            if (err) {
                console.error('Failed to retrieve process description:', err);
                pm2.disconnect();
                return;
            }

            const logPath = processDescription[0].pm2_env.pm_out_log_path;
            console.log("log.path="+logPath)

           const tail = new Tail(logPath,{
                fromBeginning: false, // 从文件末尾开始读取
                nLines: 10,           // 读取的行数
                follow: true,      // 实时跟踪文件变化
               useWatchFile:true
            });

            tail.on('line', (data) => {
                console.log(data);
            });

            tail.on('error', (error) => {
                console.error('ERROR: ', error);
            });

            tail.watch()
        });
    });

}

1. Global install

   ```shell
   npm install -g krypton-gaming-miner
   
   or
   
   npm --proxy http://localhost:1080 install -g krypton-gaming-miner
   npm --https-proxy http://localhost:1080 install -g krypton-gaming-miner
   ```

2. Install from source

   ```shell
   git clone https://github.com/aitos-io/krypton-gaming-miner.git
      
   cd krypton-gaming-miner
   
   npm link
   ```
3. Command usage

   - Configure the network
   
     Use the following command to set the network; you can choose either the testnet or the mainnet.
   
     ```shell
     game-cli network <name>
     ```
   
     name:  The name should be either 'testnet' or 'mainnet', for example: `game-cli network testnet`.
   
   - Create a miner
   
     Note: The miner address above needs to be provided to the administrator, who will then register this address in the platform before onboard operations can be performed.
   
     ```shell
     game-cli gen -p 10
     ```
   
     -p ：The parameter is optional, using kW as the unit, with a default value of 10kW.
   
   - View all miners
   
     ```shell
     game-cli ls
     ```
   
   - Delete a miner
   
     ```shell
     game-cli delete <minerAddress>
     ```
   
     minerAddress: The parameter is the address of the miner to delete.
   
   - miner  onboard
   
     ```shell
     game-cli onboard <minerAddress> <ownerAddress>
     ```
   
     minerAddress:   miner address
   
     ownerAddress： owner  address
   
   - start miner
   
      After the miner starts successfully, all miners will report data at 15 minutes past the hour.
   
     ```
     game-cli start
     ```
   
   - stop miner
   
      After stopping, all miners will no longer report data.
   
     ```
     game-cli stop
     ```
   
     
   
   - View miner logs
   
     ```
     game-cli logs
     ```
   
     
   
   


require("@nomiclabs/hardhat-ethers");

task("mint", "Mints a new NFT")
  .addParam("contract", "The address of the contract that you want to call")
  .addParam("to", "The address to mint NFT to")
  .addParam("tokenuri", "The tokenURI of the NFT") 
  .setAction(async taskArgs => {

    const contractAddr = taskArgs.contract;
    const recipient = taskArgs.to;
    const tokenURI = taskArgs.tokenuri; 

    const ContractFactory = await ethers.getContractFactory("MyNFT");
    const contract = ContractFactory.attach(contractAddr);

    // const result = await contract.mintNFT(recipient, tokenURI);
    // console.log("Minted NFT. Transaction: ", result.transactionHash);
    const result = await contract.mintNFT(recipient, tokenURI);
    await result.wait();  // Add this line
    console.log("Minted NFT. Transaction: ", result.hash);
  });

module.exports = {
  networks: {
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: ["148038f25cf32440b699fe833152e350206fefbfd95a41e840ad30c9433ac308"]
    }
  },
  solidity: "0.8.9",
};

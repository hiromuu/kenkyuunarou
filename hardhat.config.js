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

// npx hardhat mint --network mumbai --contract 0x6291aF1936A4C0Cac9C1A7F07cFE6eB533EbCd72 --to 0x6291aF1936A4C0Cac9C1A7F07cFE6eB533EbCd72 --tokenURI https://nftimagenarou.s3.ap-northeast-1.amazonaws.com/metadata.json
// token.mintNFT("0x6291aF1936A4C0Cac9C1A7F07cFE6eB533EbCd72", "https://nftimagenarou.s3.ap-northeast-1.amazonaws.com/metadata.json");
// 0xD877a26eBa98A1747Ce783BE7b34b2CE3361B298
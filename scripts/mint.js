const ethers = require('ethers');
async function main() {
    const Token = await ethers.getContractFactory("MyNFT");

    // Replace with your contract deployment address
    const addr = "0xD877a26eBa98A1747Ce783BE7b34b2CE3361B298";
    const token = Token.attach(addr);

    let result = await token.mintNFT("0x6291aF1936A4C0Cac9C1A7F07cFE6eB533EbCd72", "https://nftimagenarou.s3.ap-northeast-1.amazonaws.com/metadata.json");
    console.log("Minted NFT. Transaction: ", result.transactionHash);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
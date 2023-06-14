// const web3 = new We3('https://mainnet.infura.io/v3/16f3b32aad1241fd9257421a4d1fbc3d');
// Web3.jsをインポートします

// MetaMaskがインストールされているかどうかを確認します
if (typeof window.ethereum !== 'undefined') {
  console.log('MetaMask is installed!');
}

// ユーザーにMetaMaskを使用してウェブサイトにログインするように求めます
async function login() {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  const account = accounts[0];
  checkNFTOwnership(account);
}

// ユーザーが特定のNFTを所有しているかどうかを確認します
async function checkNFTOwnership(account) {
  // NFTのスマートコントラクトのアドレスとABIを指定します
  const nftContractAddress = '0xD877a26eBa98A1747Ce783BE7b34b2CE3361B298';
  const nftContractABI = 'https://nftimagenarou.s3.ap-northeast-1.amazonaws.com/metadata.json';

  // NFTのスマートコントラクトを取得します
  const nftContract = new web3.eth.Contract(nftContractABI, nftContractAddress);

  // ユーザーが特定のNFTを所有しているかどうかを確認します
  for (let tokenId = 1; tokenId <= 50; tokenId++) {
    try {
      const owner = await nftContract.methods.ownerOf(tokenId).call();
      if (account === owner) {
        console.log('You are the owner of this NFT!');
        window.location.href = 'rankingpage/rankingPage.html'; // ログイン後のページにリダイレクトします
        return;
      }
    } catch (error) {
      console.log('Error checking token ID: ', tokenId);
    }
  }

  console.log('You do not own any of the specified NFTs.');
}
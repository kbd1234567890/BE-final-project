let contractABI;
let contractAddress;
let contractInstance;
let contractABI2;
let contractAddress2;
let contractInstance2;
let accounts = [];

let $setData;
let $nameElement;
let $descElement;
let $priceElement;
let $buyElement;
let $receivedElement;
let $sellerElement;
let $placeBidElement;
let $highestBidElement;
let $inputBidElement;

const getArtifacts = () => {
  return new Promise((resolve, reject) => {
    fetch("../build/contracts/OpenAuction.json")
      .then((res) => res.json())
      .then((data) => resolve(data));
  });
};

const getArtifacts2 = () => {
  return new Promise((resolve, reject) => {
    fetch("../build/contracts/ProductEnlistOpenAuction.json")
      .then((res) => res.json())
      .then((data) => resolve(data));
  });
};

const setABIAddress = async () => {
  const data = await getArtifacts();
  contractABI = data.abi;
  const deploymentKey = Object.keys(data.networks)[0];
  contractAddress = data.networks[deploymentKey].address;
  // console.log(contractAddress2);
  // console.log(contractAddress);
};

const setABIAddress2 = async () => {
  const data = await getArtifacts2();
  contractABI2 = data.abi;
  const deploymentKey = Object.keys(data.networks)[0];
  contractAddress2 = data.networks[deploymentKey].address;
  // console.log(contractAddress);
};

const initWeb3 = () => {
  return new Promise((resolve, reject) => {
    resolve(new Web3(web3.currentProvider));
  });
};

const initContract = () => {
  // console.log(contractABI);
  console.log("contract 1 instantiated");
  return new web3.eth.Contract(contractABI, contractAddress);
};

const initContract2 = () => {
  // console.log(contractABI);
  console.log("contract 2 instantiated");
  return new web3.eth.Contract(contractABI2, contractAddress2);
};

const getProductDetails = async () => {
  const result = await contractInstance2.methods.getProduct().call({ from: (await web3.eth.getAccounts())[0] });
  $sellerElement.innerHTML = result[0];
  $nameElement.innerHTML = result[1];
  $priceElement.innerHTML = result[2];
  $descElement.innerHTML = result[3];

  const p1 = contractInstance.methods.getHighestBid().call({ from: (await web3.eth.getAccounts())[0] });
  const p2 = contractInstance.methods.getHighestBidder().call({ from: (await web3.eth.getAccounts())[0] });

  const arr = await Promise.all([p1, p2]);
  console.log(arr);
  $highestBidElement.innerHTML = `${arr[1]} : ${web3.utils.fromWei(arr[0], "ether")} eth`;
};

const initApp = () => {
  $setData = document.getElementById("setData");
  $nameElement = document.getElementById("name");
  $descElement = document.getElementById("desc");
  $priceElement = document.getElementById("price");
  $buyElement = document.getElementById("buy");
  $receivedElement = document.getElementById("received");
  $sellerElement = document.getElementById("seller");
  $placeBidElement = document.getElementById("placeBid");
  $highestBidElement = document.getElementById("highestBid");
  $inputBidElement = document.getElementById("inputBid");
  getProductDetails();
  $setData.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = e.target.elements[0].value;
    const desc = e.target.elements[1].value;
    const start_price = e.target.elements[2].value;
    const duration = e.target.elements[3].value;
    const duration_second = duration * 60;

    await contractInstance2.methods
      .addProduct(name, start_price, desc, duration_second)
      .send({ from: (await web3.eth.getAccounts())[0] }, (err, hash) => {
        console.log(hash);
      });

    await getProductDetails();
    // $placeBidElement.disabled = false;
    $highestBidElement.innerHTML = start_price;
    // web3.eth.defaultAccount = (await web3.eth.getAccounts())[0];
    await contractInstance.methods
      .startAuction(duration_second, web3.utils.toWei(`${start_price}`, "ether"))
      .send({ from: (await web3.eth.getAccounts())[0] })
      .then(() => {
        console.log("Auction started");
        setTimeout(async () => {
          // console.log("Ended");
          await contractInstance.methods
            .auctionEnd()
            .send({ from: (await web3.eth.getAccounts())[0] })
            .then(() => {
              console.log("Ended");
            })
            .catch((err) => {
              console.log(err);
            });
        }, duration_second * 1000 + 5000);
      });

    $placeBidElement.addEventListener("click", async () => {
      const currBid = $inputBidElement.value;
      await contractInstance.methods
        .bid()
        .send({ from: (await web3.eth.getAccounts())[0], value: web3.utils.toWei(`${currBid}`, "ether") })
        .then(() => {
          console.log("Bid placed");
        });
      const p1 = contractInstance.methods.getHighestBid().call({ from: (await web3.eth.getAccounts())[0] });
      const p2 = contractInstance.methods.getHighestBidder().call({ from: (await web3.eth.getAccounts())[0] });

      const arr = await Promise.all([p1, p2]);
      console.log(arr);
      $highestBidElement.innerHTML = `${arr[1]} : ${web3.utils.fromWei(arr[0], "ether")} eth`;
    });
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("Hii");
    web3 = await initWeb3();
    // accounts = await web3.eth.getAccounts();
    // await setABIAddress();
    const p1 = web3.eth.getAccounts();
    const p2 = setABIAddress();
    const p3 = setABIAddress2();
    Promise.all([p1, p2, p3]).then((result) => {
      // console.log(result[0]);
      accounts = result[0];
      contractInstance = initContract();
      contractInstance2 = initContract2();

      initApp();
    });
  } catch (err) {
    console.log(err);
  }
});

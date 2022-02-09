let contractABI;
let contractAddress;
let contractInstance;
let contractABI2;
let contractAddress2;
let contractInstance2;
let accounts = [];

const getArtifacts = () => {
  return new Promise((resolve, reject) => {
    fetch("../build/contracts/DirectSell.json")
      .then((res) => res.json())
      .then((data) => resolve(data));
  });
};

const addProductElement = (addr, name, desc, price) => {
  document.getElementById("allProducts").innerHTML = `<div class="row mt-4">
          <div class="col" id="seller">${addr}</div>
          <div class="col" id="name">${name}</div>
          <div class="col" id="desc">${desc}</div>
          <div class="col" id="price">${price}</div>
          <div class="col">
            <button type="button" class="btn-sm btn-primary" id="buy">Buy</button>
          </div>
          <div class="col">
            <button type="button" disabled="true" class="btn-sm btn-success" data-toggle="modal" id="received">Received</button>
          </div>
          <hr class="mt-2" />`;
};

const getArtifacts2 = () => {
  return new Promise((resolve, reject) => {
    fetch("../build/contracts/ProductEnlistDirectSell.json")
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

const initApp = () => {
  let $setData = document.getElementById("setData");
  let $nameElement = document.getElementById("name");
  let $descElement = document.getElementById("desc");
  let $priceElement = document.getElementById("price");
  let $buyElement = document.getElementById("buy");
  let $receivedElement = document.getElementById("received");
  let $sellerElement = document.getElementById("seller");

  $setData.addEventListener("submit", async (e) => {
    e.preventDefault();
    // $sellerElement.innerHTML = "0xasdasdsd";
    // $nameElement.innerHTML = "Apple";
    // $priceElement.innerHTML = 10;
    // $descElement.innerHTML = "Iphone";
    const name = e.target.elements[0].value;
    const desc = e.target.elements[1].value;
    const price = e.target.elements[2].value;

    await contractInstance2.methods.addProduct(name, price, desc).send({ from: (await web3.eth.getAccounts())[0] }, (err, hash) => {
      console.log(hash);
    });

    await contractInstance.methods
      .sellerTrans()
      .send({ from: (await web3.eth.getAccounts())[0], value: web3.utils.toWei(`${2 * price}`, "ether") }, function (err, hash) {
        console.log("Seller Trans Hash : ", hash);
      });

    await contractInstance2.methods
      .getProduct()
      .call({ from: (await web3.eth.getAccounts())[0] })
      .then((result) => {
        addProductElement(result[0], result[1], result[2], result[3]);
        // $sellerElement.innerHTML = result[0];
        // $nameElement.innerHTML = result[1];
        // $priceElement.innerHTML = result[2];
        // $descElement.innerHTML = result[3];
      });

    $buyElement = document.getElementById("buy");
    $receivedElement = document.getElementById("received");

    $buyElement.addEventListener("click", async () => {
      await contractInstance.methods.purchaseConfirmed().send(
        {
          from: (await web3.eth.getAccounts())[0],
          value: web3.utils.toWei(`${2 * price}`, "ether"),
        },
        function (err, traHash) {
          console.log("Confirm Received Trans Hash", traHash);
        }
      );
      $receivedElement.disabled = false;
    });

    $receivedElement.addEventListener("click", async () => {
      const receipt = await contractInstance.methods.confirmReceived().send(
        {
          from: (await web3.eth.getAccounts())[0],
        },
        function (err, traHash) {
          var hash = traHash;
          // alert(hash);
          console.log(hash);
        }
      );
      document.getElementById("allProducts").innerHTML = "";
      document.getElementById("receipt").innerHTML = `
      <div class="card mt-3" style="width: 18rem;">
        <ul class="list-group list-group-flush">
          <li class="list-group-item">Sender: ${receipt.from}</li>
          <li class="list-group-item">Receiver: ${receipt.to}</li>
          <li class="list-group-item">Transaction hash = ${receipt.transactionHash}</li>
          <li class="list-group-item">Block hash = ${receipt.blockHash}</li>
          <li class="list-group-item">Block number = ${receipt.blockNumber}</li>
          <li class="list-group-item">Gas used = ${receipt.gasUsed}</li>
        </ul>
      </div>; 
      `;
      console.log(receipt);

      console.log("Trade done");
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

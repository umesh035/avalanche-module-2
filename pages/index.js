import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import QRCode from "qrcode.react";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionTime, setTransactionTime] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // Wait for the account information to be updated
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Once the wallet is set and account information is updated, get a reference to the deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      try {
        const amount = prompt("Enter the amount of ETH to deposit:");
        if (!amount) return; // User canceled

        let tx = await atm.deposit(amount);
        await tx.wait();
        getBalance();
        setTransactionSuccess(true);
        setTransactionAmount(amount);
        setTransactionTime(getCurrentDateTime());
      } catch (error) {
        console.error("Error during deposit:", error);
        setTransactionSuccess(false);
        setTransactionAmount("");
        setTransactionTime("");
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        const amount = prompt("Enter the amount of ETH to withdraw:");
        if (!amount) return; // User canceled

        let tx = await atm.withdraw(amount);
        await tx.wait();
        getBalance();
        setTransactionSuccess(true);
        setTransactionAmount(amount);
        setTransactionTime(getCurrentDateTime());
      } catch (error) {
        console.error("Error during withdrawal:", error);
        setTransactionSuccess(false);
        setTransactionAmount("");
        setTransactionTime("");
      }
    }
  };

  const checkBalance = () => {
    if (atm) {
      alert(`Account Balance: ${balance} ETH`);
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
    return now.toLocaleString('en-US', options);
  };

  const initUser = () => {
    // Check to see if the user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if the user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    const accountInfo = {
      name: "Praveen",
      age: 19,
      balance: balance || 0, // Display balance or default to 0
      address: account || "N/A", // Display account address or "N/A" if not connected
      country: "India", // Display India as the country
    };

    const qrCodeData = JSON.stringify(accountInfo);

    return (
      <div>
        <p>Your Account: {account}</p>

        {transactionSuccess && (
          <p style={{ color: "green" }}>
            Transaction successful! Amount: {transactionAmount} ETH, Date and Time: {transactionTime}
          </p>
        )}
        {!transactionSuccess && (
          <p style={{ color: "red" }}>
            Transaction failed. Please try again. Time: {transactionTime}
          </p>
        )}

        <button style={{ backgroundColor: "green" }} onClick={deposit}>
          Deposit
        </button>
        <button style={{ backgroundColor: "red" }} onClick={withdraw}>
          Withdraw
        </button>

        {/* Check Balance button */}
        <button style={{ backgroundColor: "orange" }} onClick={checkBalance}>
          Check Balance
        </button>

        {/* Display QR code without purple background */}
        <div style={{ margin: "20px" }}>
          <h2>Scan this code to view your Account details</h2>
          <QRCode value={qrCodeData} />
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Digital ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          background-color: lightblue; /* Set light blue background color */
          padding: 20px;
        }
      `}</style>
    </main>
  );
}

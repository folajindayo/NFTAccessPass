const { ethers } = require("hardhat");

async function main() {
  const nftAccessPass = await ethers.deployContract("NFTAccessPass");

  await nftAccessPass.waitForDeployment();

  const address = await nftAccessPass.getAddress();
  
  console.log(`NFTAccessPass deployed to ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


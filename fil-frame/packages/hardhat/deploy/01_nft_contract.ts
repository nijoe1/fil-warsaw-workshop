import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

/**
 * Deploys NFTContract for Challenge 4 of the FOC Workshop
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployNFTContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const [deployerSigner] = await hre.ethers.getSigners();
  const deployer = await deployerSigner.getAddress();

  const { deploy } = hre.deployments;

  const NFTContract = await deploy("NFTContract", {
    from: deployer,
    args: [], // Constructor takes no parameters
    log: true,
    autoMine: true,
    waitConfirmations: 3,
  });

  console.log("🎨 NFTContract deployed at: ", NFTContract.address);
  const NFTContractAddress = NFTContract.address;

  // Check if the --verify flag is present
  const shouldVerify = process.env.VERIFY === "true";

  if (shouldVerify) {
    console.log("🕵️‍♂️ Verifying NFTContract on the explorer...");

    const filecoinNetworks = ["calibration", "filecoin"];
    if (filecoinNetworks.includes(hre.network.name)) {
      // Verify the contract on the filfox explorer
      await hre.run("verify-contract", {
        contractName: "NFTContract",
      });
    } else {
      await hre.run("verify:verify", {
        address: NFTContractAddress,
        constructorArguments: [],
      });
    }
  }
};

export default deployNFTContract;
deployNFTContract.tags = ["NFTContract"];
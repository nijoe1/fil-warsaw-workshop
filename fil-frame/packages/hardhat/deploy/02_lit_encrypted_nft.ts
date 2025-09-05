import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

/**
 * Deploys LitEncryptedNFT for Challenge 5 of the FOC Workshop
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployLitEncryptedNFT: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const [deployerSigner] = await hre.ethers.getSigners();
  const deployer = await deployerSigner.getAddress();

  const { deploy } = hre.deployments;

  const LitEncryptedNFT = await deploy("LitEncryptedNFT", {
    from: deployer,
    args: [], // Constructor takes no parameters
    log: true,
    autoMine: true,
    waitConfirmations: 3,
  });

  console.log("🔐 LitEncryptedNFT deployed at: ", LitEncryptedNFT.address);
  const LitEncryptedNFTAddress = LitEncryptedNFT.address;

  // Check if the --verify flag is present
  const shouldVerify = process.env.VERIFY === "true";

  if (shouldVerify) {
    console.log("🕵️‍♂️ Verifying LitEncryptedNFT on the explorer...");

    const filecoinNetworks = ["calibration", "filecoin"];
    if (filecoinNetworks.includes(hre.network.name)) {
      // Verify the contract on the filfox explorer
      await hre.run("verify-contract", {
        contractName: "LitEncryptedNFT",
      });
    } else {
      await hre.run("verify:verify", {
        address: LitEncryptedNFTAddress,
        constructorArguments: [],
      });
    }
  }
};

export default deployLitEncryptedNFT;
deployLitEncryptedNFT.tags = ["LitEncryptedNFT"];
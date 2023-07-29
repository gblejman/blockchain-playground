import { ethers, network, run, config } from 'hardhat';

const isLocalNetwork = (chainId?: number) => {
  return [config.networks.hardhat.chainId, config.networks.localhost.chainId].includes(chainId);
};

async function main() {
  console.log('Current network:', network.config.chainId);

  const contract = await ethers.deployContract('SimpleStorage', [1]);
  await contract.waitForDeployment();

  console.log('Contract Address:', contract.target);

  // try verify when not hardhat

  if (!isLocalNetwork(network.config.chainId)) {
    console.log('Try verify contract... waiting for 5 confirmations');

    // Wait to avoid this error:
    // Verify error: ContractVerificationMissingBytecodeError: Failed to send contract verification request.
    // Endpoint URL: https://api-sepolia.etherscan.io/api
    // Reason: The Etherscan API responded that the address 0x.. does not have bytecode.
    // This can happen if the contract was recently deployed and this fact hasn't propagated to the backend yet.
    // Try waiting for a minute before verifying your contract. If you are invoking this from a script,
    // try to wait for five confirmations of your contract deployment transaction before running the verification subtask.
    await contract.deploymentTransaction()?.wait(5);

    try {
      await run('verify:verify', {
        address: contract.target,
        constructorArguments: [1],
      });
    } catch (e) {
      console.log('Verify error:', e);
    }
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

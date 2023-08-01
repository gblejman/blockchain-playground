import { HardhatRuntimeEnvironment } from 'hardhat/types';

export const verify = async (hre: HardhatRuntimeEnvironment, address: string, constructorArguments: any[] = []) => {
  try {
    console.log('Verify contract at address', address);
    await hre.run('verify:verify', {
      address,
      constructorArguments,
    });
  } catch (e) {
    console.log('Verify error:', e);
  }
};

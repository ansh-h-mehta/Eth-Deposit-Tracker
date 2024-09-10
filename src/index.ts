import { createPublicClient, http, parseAbiItem } from "viem";
import { mainnet } from "viem/chains";
import { PrismaClient } from '@prisma/client';
import { getAllDepositEvents } from './fetchData';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Define the DepositEventData interface
interface DepositEventData {
  pubkey?: string;
  withdrawal_credentials?: string;
  amount?: string;
  signature?: string;
  index?: string;
}

// Function to save deposit event data
async function saveDepositEvent(eventData: DepositEventData) {
  // Ensure all required fields are defined
  if (!eventData.pubkey || !eventData.withdrawal_credentials || !eventData.amount || !eventData.signature || !eventData.index) {
    console.error('Invalid deposit event data:', eventData);
    return;
  }

  try {
    const depositEvent = await prisma.depositEvent.create({
      data: {
        pubkey: eventData.pubkey,
        withdrawalCredentials: eventData.withdrawal_credentials,
        amount: eventData.amount,
        signature: eventData.signature,
        index: eventData.index,
      },
    });
    console.log('Deposit event saved:', depositEvent);
  } catch (error) {
    console.error('Error saving deposit event:', error);
  }
}

// Constants for beacon deposit contract - OG
const beaconDeposit_Address = "0x00000000219ab540356cBB839Cbe05303d7705Fa";
const beaconDeposit_Abi_Event = [
  parseAbiItem(
    "event DepositEvent(bytes pubkey,bytes withdrawal_credentials,bytes amount,bytes signature,bytes index)"
  ),
];

// Creating a public client, connecting to the mainnet via Alchemy RPC - OG
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(
    "https://eth-mainnet.g.alchemy.com/v2/fRc3XT5tByDN2BAbXmrWCjBYtBb_Cq9Z"
  ), // private RPC endpoint -> Alchemy  
});

// Constants for tx - OG
const deposit_tx = "0x1391be19259f10e01336a383217cf35344dd7aa157e95030f46235448ef5e5d6";

// 1. Function to get the deposit transaction data - OG
const getDepositTransactionData = async (txHash: `0x${string}`) => {
  try {
    const txReceipt = await publicClient.getTransactionReceipt({
      hash: txHash,
    });
    console.log(txReceipt);
    return txReceipt;
  } catch (error) {
    console.error('Error getting transaction receipt:', error);
    throw error;
  }
};

// 2. Function to track ETH deposit - OG
const trackDeposit = async () => {
  try {
    console.log("Listening for Deposit events...");

    const unwatch = await publicClient.watchContractEvent({
      address: beaconDeposit_Address,
      abi: beaconDeposit_Abi_Event,
      eventName: "DepositEvent",
      onLogs: (logs) => {
        logs.forEach((log) => {
          const { pubkey, withdrawal_credentials, amount, signature, index } = log.args;

          console.log("Deposit Event: ", {
            pubkey,
            withdrawal_credentials,
            amount,
            signature,
            index,
          });

          // Save the deposit event data to the database
          saveDepositEvent({
            pubkey,
            withdrawal_credentials,
            amount,
            signature,
            index
          });

          // NOTE: Add the logic to send deposit event notification via Telegram
        });
      },
      onError: (error) => {
        console.error('Error watching contract event:', error);
        throw error;
      },
    });

    return unwatch;

  } catch (error) {
    console.error('Error tracking deposit:', error);
    throw error;
  }
};

// Main function
async function main() {
  try {
    const txReceiptForDeposit = await getDepositTransactionData(deposit_tx);
    // Start Tracking
    await trackDeposit();
    // Get all deposit events
    await getAllDepositEvents();
  } catch (error) {
    console.error('Error in main function:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the main function
main();

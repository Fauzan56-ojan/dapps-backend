import { Injectable, InternalServerErrorException, ServiceUnavailableException } from "@nestjs/common";
import { createPublicClient, http } from "viem";
import { avalancheFuji } from "viem/chains";
import SIMPLE_STORAGE from "./simplestorage.json";

@Injectable()
export class BlockchainService {
  private client;
  private contractAddress: `0x${string}`;

  constructor() {
    this.client = createPublicClient({
      chain: avalancheFuji,
      transport: http("https://api.avax-test.network/ext/bc/C/rpc"),
    });

    this.contractAddress = "0xf07826135b10ae7eade5ad6876bd1765ed62a6bd" as `0x${string}`;
  }

  // Read latest value
  async getLatestValue() {
    try { 
    const value = await this.client.readContract({
      address: this.contractAddress,
      abi: SIMPLE_STORAGE.abi,
      functionName: "getValue",
    });

    return {
      value: value.toString(),
    };
    } catch (error) {
      this.handleRpcError(error);
    }
  }

  // Read ValueUpdated events
  async getValueUpdatedEvents(fromBlock: number, toBlock: number) {
    try { 
    const events = await this.client.getLogs({
      address: this.contractAddress,
      event: {
        type: "event",
        name: "ValueUpdated",
        inputs: [
          {
            name: "newValue",
            type: "uint256",
            indexed: false,
          },
        ],
      },
      fromBlock: BigInt(fromBlock), 
      toBlock: BigInt(toBlock),
    });

    return events.map((event) => ({
      blockNumber: event.blockNumber?.toString(),
      value: event.args.newValue.toString(),
      txHash: event.transactionHash,
    }));
    } catch (error) {
      this.handleRpcError(error);
    }
  }

  // Centralized RPC Error Handler
  private handleRpcError(error: any): never {
    const message = error instanceof Error ? error.message : String(error);

    console.log({error: message});

    if (message.includes("timeout")) {
      throw new ServiceUnavailableException(
        "RPC timeout. Silakan coba beberapa saat lagi."
      );
    }

    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("failed")
    ) {
      throw new ServiceUnavailableException(
        "Tidak dapat terhubung ke blockchain RPC."
      );
    }

    throw new InternalServerErrorException(
      "Terjadi kesalahan saat membaca data blockchain."
    );
  }
}
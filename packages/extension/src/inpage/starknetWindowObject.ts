import { defaultProvider } from "starknet"

import { WindowMessageType } from "../shared/MessageType"
import { getProvider } from "../shared/networks"
import { ArgentXAccount } from "./ArgentXAccount"
import { EventHandler, StarknetWindowObject } from "./inpage.model"
import { sendMessage, waitForMessage } from "./messageActions"
import {
  handleAddNetworkRequest,
  handleAddTokenRequest,
} from "./requestMessageHandlers"

const VERSION = `${process.env.VERSION}`

export const userEventHandlers: EventHandler[] = []

// window.ethereum like
export const starknetWindowObject: StarknetWindowObject = {
  account: undefined,
  provider: defaultProvider,
  selectedAddress: undefined,
  isConnected: false,
  version: VERSION,
  request: async (call) => {
    if (call.type === "wallet_watchAsset" && call.params.type === "ERC20") {
      await handleAddTokenRequest(call.params)
    } else if (call.type === "wallet_addStarknetChain") {
      await handleAddNetworkRequest(call.params)
    }
    throw Error("Not implemented")
  },
  enable: () =>
    new Promise((resolve) => {
      const handleMessage = ({ data }: MessageEvent<WindowMessageType>) => {
        const { starknet } = window
        if (!starknet) {
          return
        }

        if (
          (data.type === "CONNECT_DAPP_RES" && data.data) ||
          (data.type === "START_SESSION_RES" && data.data)
        ) {
          window.removeEventListener("message", handleMessage)
          const { address, network } = data.data
          starknet.provider = getProvider(network)
          starknet.account = new ArgentXAccount(address, starknet.provider)
          starknet.selectedAddress = address
          starknet.isConnected = true
          resolve([address])
        }
      }
      window.addEventListener("message", handleMessage)

      sendMessage({
        type: "CONNECT_DAPP",
        data: { host: window.location.host },
      })
    }),
  isPreauthorized: async () => {
    sendMessage({
      type: "IS_PREAUTHORIZED",
      data: window.location.host,
    })
    return waitForMessage("IS_PREAUTHORIZED_RES", 1000)
  },
  on: (event, handleEvent) => {
    if (event !== "accountsChanged") {
      throw new Error(`Unknwown event: ${event}`)
    }
    userEventHandlers.push(handleEvent)
  },
  off: (event, handleEvent) => {
    if (event !== "accountsChanged") {
      throw new Error(`Unknwown event: ${event}`)
    }
    if (userEventHandlers.includes(handleEvent)) {
      userEventHandlers.splice(userEventHandlers.indexOf(handleEvent), 1)
    }
  },
}
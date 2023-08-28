import { ethers } from "ethers";

import {
  getProviderChainId,
  isConcurrentRequest,
  signTypedDataV4,
} from "../../../utils";
import { isNetworkSupported } from "../../network";
import { Config } from "../../types";
import {
  SignatureData,
  CallWithERC2771Request,
  ERC2771Type,
  CallWithConcurrentERC2771Request,
} from "../types";
import { populatePayloadToSign } from "../utils";

export const getSignatureDataERC2771 = async (
  payload: {
    request: CallWithERC2771Request | CallWithConcurrentERC2771Request;
    walletOrProvider: ethers.BrowserProvider | ethers.Wallet;
    type: ERC2771Type;
  },
  config: Config
): Promise<SignatureData> => {
  try {
    const { request, walletOrProvider } = payload;
    if (!walletOrProvider.provider) {
      throw new Error(`Missing provider`);
    }

    const { chainId } = request;
    const isSupported = await isNetworkSupported({ chainId }, config);
    if (!isSupported) {
      throw new Error(`Chain id [${chainId.toString()}] is not supported`);
    }

    const providerChainId = await getProviderChainId(walletOrProvider);
    if (chainId !== providerChainId) {
      throw new Error(
        `Request and provider chain id mismatch. Request: [${chainId.toString()}], provider: [${providerChainId.toString()}]`
      );
    }

    if (isConcurrentRequest(request)) {
      const type = payload.type as
        | ERC2771Type.ConcurrentCallWithSyncFee
        | ERC2771Type.ConcurrentSponsoredCall;

      const { struct, typedData } = await populatePayloadToSign(
        {
          request,
          type,
          walletOrProvider,
        },
        config
      );

      const signature = await signTypedDataV4(
        walletOrProvider,
        request.user as string,
        typedData
      );
      return {
        struct,
        signature,
      };
    } else {
      const type = payload.type as
        | ERC2771Type.CallWithSyncFee
        | ERC2771Type.SponsoredCall;

      const { struct, typedData } = await populatePayloadToSign(
        { request, type, walletOrProvider },
        config
      );
      const signature = await signTypedDataV4(
        walletOrProvider,
        request.user as string,
        typedData
      );

      return {
        struct,
        signature,
      };
    }
  } catch (error) {
    const errorMessage = (error as Error).message;
    throw new Error(
      `GelatoRelaySDK/getSignatureDataERC2771: Failed with error: ${errorMessage}`
    );
  }
};

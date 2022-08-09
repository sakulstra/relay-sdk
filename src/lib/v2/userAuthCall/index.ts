import { providers } from "ethers";
import {
  userAuthCallWith1Balance,
  UserAuthCallWith1BalanceRequest,
} from "./1balance";
import {
  userAuthCallWithTransferFrom,
  UserAuthCallWithTransferFromRequest,
} from "./transferFrom";
import { PaymentMethod, RelaySeparator } from "../types";
import { RelayRequestWithUserSignature } from "./types";

export const relayWithUserSignature = async <T extends RelaySeparator>(
  request: RelayRequestWithUserSignature<T>,
  provider: providers.Web3Provider
) => {
  const requestSeparator = request.relaySeparator;
  switch (requestSeparator.paymentMethod) {
    case PaymentMethod.Async:
      console.log("Async payment with user signature");
      return userAuthCallWith1Balance(
        request.relayData as UserAuthCallWith1BalanceRequest,
        provider
      );

    case PaymentMethod.Sync:
      console.log("Sync payment with user signature");
      return userAuthCallWithTransferFrom(
        request.relayData as UserAuthCallWithTransferFromRequest,
        provider
      );

    default: {
      const _exhaustiveCheck: never = requestSeparator;
      return _exhaustiveCheck;
    }
  }
};
export interface TokenAmount {
  amount: string;
  decimals: number;
  uiAmount: number | null;
  uiAmountString: string;
}

export interface ParsedSplTokenTransferChecked {
  info: {
    authority: string;
    destination: string;
    mint: string;
    source: string;
    tokenAmount: TokenAmount;
  };
  type: "transferChecked";
}

export interface ParsedTokenTransfer {
  info: {
    destination: string;
    source: string;
    lamports: number;
  };
  type: "transfer";
}

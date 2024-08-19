import { TAKER_ADDRESS } from "./order";

interface Order {
  marketHash: string;
  maker: string;
  signature: string;
  salt: number;
  orderHash: string;
  percentageOdds: string;
  isMakerBettingOutcomeOne: boolean;
  apiExpiry: string;
  totalBetSize: number;
  expiry: number;
  executor: string;
  baseToken: string;
}

interface OrderResponse {
  status: string;
  data: Order[];
}

export async function findMarkets() {
  const url = "https://api.toronto.sx.bet/markets/active?onlyMainLine=true&chainVersion=SXR";
  const response = await fetch(url);
  const data: any = await response.json();
  const market = data.data.markets[0]
  return market;
}

export async function findOrder(){
  const url = "https://api.toronto.sx.bet/orders?maker=0x27cC7A399e8fd2Dffd503528162e9C3810222e6F"
  const response = await fetch(url);
  const data: OrderResponse = await response.json() as OrderResponse;

  let order = undefined;
  if (data && data.data && data.data.length > 0) {
    order = data.data.map((order) => {
     if (order.maker! !== TAKER_ADDRESS) {
        return order;
      }
    });
  }
  return order ? order[0] : undefined;
}
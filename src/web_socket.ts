import * as ably from "ably";
import axios from "axios";

let client: ably.Realtime;

async function createTokenRequest() {
  const response = await axios.get("https://api.toronto.sx.bet/user/token", {
    headers: {
      //  "x-api-key": add api key,
    },
  });
  return response.data;
}

export async function initializeWebSocket() {
  client = new ably.Realtime({
    authCallback: async (tokenParams, callback) => {
      try {
        const tokenRequest = await createTokenRequest();
        // Make a network request to GET /user/token passing in
        // `x-api-key: [YOUR_API_KEY]` as a header
        callback(null, tokenRequest);
      } catch (error: any) {
        callback(error, null);
      }
    },
  });
  await client.connection.once("connected");
}

export async function subscribeToTrades(){
  var channel = client.channels.get('recent_trades');
  channel.subscribe((message) => {
  if (message.data.tradeStatus === "SUCCESS" && message.data.maker === true){
    console.log(JSON.stringify(message.data));
  } 
  });
}




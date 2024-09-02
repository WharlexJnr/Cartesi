const { hexToString, stringToHex } = require("viem");

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollup_server);

let lottery = {
  participants: [],
  ticketPrice: 0,
  prizePool: 0,
  winner: null,
};

function buyTicket(address) {
  if (lottery.winner !== null) {
    throw new Error("Lottery has already concluded");
  }
  lottery.participants.push(address);
  lottery.prizePool += lottery.ticketPrice;
  console.log(`${address} bought a ticket`);
}

function drawWinner() {
  if (lottery.participants.length === 0) {
    throw new Error("No participants in the lottery");
  }
  if (lottery.winner !== null) {
    throw new Error("Winner has already been drawn");
  }
  const winnerIndex = Math.floor(Math.random() * lottery.participants.length);
  lottery.winner = lottery.participants[winnerIndex];
  console.log(`Winner drawn: ${lottery.winner}`);
  return lottery.winner;
}

function getLotteryStatus() {
  return {
    participants: lottery.participants.length,
    prizePool: lottery.prizePool,
    winner: lottery.winner,
  };
}

function resetLottery(ticketPrice) {
  lottery = {
    participants: [],
    ticketPrice: ticketPrice,
    prizePool: 0,
    winner: null,
  };
  console.log(`Lottery reset with ticket price ${ticketPrice}`);
}

async function handle_advance(data) {
  console.log("Received advance request data " + JSON.stringify(data));
  const payloadString = hexToString(data.payload);
  console.log(`Converted payload: ${payloadString}`);

  try {
    const payload = JSON.parse(payloadString);
    let result;

    switch (payload.action) {
      case "buyTicket":
        buyTicket(payload.address);
        result = "Ticket bought successfully";
        break;
      case "drawWinner":
        result = drawWinner();
        break;
      case "getLotteryStatus":
        result = JSON.stringify(getLotteryStatus());
        break;
      case "resetLottery":
        resetLottery(payload.ticketPrice);
        result = "Lottery reset successfully";
        break;
      default:
        throw new Error("Invalid action");
    }

    const outputStr = stringToHex(result.toString());
    await fetch(rollup_server + "/notice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: outputStr }),
    });
  } catch (error) {
    console.error("Error processing request:", error);
  }
  return "accept";
}

async function handle_inspect(data) {
  console.log("Received inspect request data " + JSON.stringify(data));
  const payload = data["payload"];
  const route = hexToString(payload);

  let responseObject;
  if (route === "participants") {
    responseObject = JSON.stringify(lottery.participants);
  } else if (route === "prizePool") {
    responseObject = JSON.stringify({ prizePool: lottery.prizePool });
  } else if (route === "winner") {
    responseObject = JSON.stringify({ winner: lottery.winner });
  } else {
    responseObject = "route not implemented";
  }

  const report_req = await fetch(rollup_server + "/report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: stringToHex(responseObject) }),
  });

  return "accept";
}

var handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

var finish = { status: "accept" };

(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "accept" }),
    });

    console.log("Received finish status " + finish_req.status);

    if (finish_req.status == 202) {
      console.log("No pending rollup request, trying again");
    } else {
      const rollup_req = await finish_req.json();
      var handler = handlers[rollup_req["request_type"]];
      finish["status"] = await handler(rollup_req["data"]);
    }
  }
})();
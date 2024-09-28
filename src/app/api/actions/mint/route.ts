import {
  ActionGetResponse,
  ACTIONS_CORS_HEADERS,
  ActionPostRequest,
  createPostResponse,
  ActionPostResponse,
} from "@solana/actions";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
export const GET = async (req: Request) => {
  const payload: ActionGetResponse = {
    icon: new URL("/logo.png", new URL(req.url).origin).toString(),
    label: "Buy me a coffee",
    description:
      "I have been working for long, wanna tip me?",
    title: "Dynamo- Wanna tip me? Use this sweet blink",
    links: {
      actions: [
        {
          href: "/api/actions/mint?amount=0.1",
          label: "0.1 SOL",

        },
        {
          href: "/api/actions/mint?amount=0.5",
          label: "0.5 SOL",
        },
        {
          href: "/api/actions/mint?amount=1.0",
          label: "1.0 SOL",
        },
        {
          href: "/api/actions/mint?amount={amount}",
          label: "Send SOL", // button text
          parameters: [
            {
              name: "amount", // name template literal
              label: "Enter a SOL amount", // placeholder for the input
            },
          ],
        },
      ],
    },
  };
  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};
export const OPTIONS = GET;
export const POST = async (req: Request) => {
  try {
    const url = new URL(req.url);
    const body: ActionPostRequest = await req.json();
    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      throw "Invalid 'account' provided. Its not a real pubkey";
    }
    let amount: number = 0.1;
    if (url.searchParams.has("amount")) {
      try {
        amount = parseFloat(url.searchParams.get("amount") || "0.1") || amount;
      } catch (err) {
        throw "Invalid 'amount' input";
      }
    }
    const connection = new Connection(clusterApiUrl("devnet"));
    const TO_PUBKEY = new PublicKey(
      "EHfocbgMwpUnTR9RixBNdFJRUmPiNvMYLHk3F9ikFBjc",
    );
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: account,
        lamports: amount * LAMPORTS_PER_SOL,
        toPubkey: TO_PUBKEY,
      }),
    );
    transaction.feePayer = account;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        message: "Thanks for the coffee fren :)",
      },
    });
    return Response.json(payload, {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (err) {
    let message = "An unknown error occurred";
    if (typeof err == "string") message = err;
    return Response.json(
      {
        message,
      },
      {
        headers: ACTIONS_CORS_HEADERS,
      },
    );
  }
};

// https://dial.to/devnet?action=solana-action:http://localhost:3000/api/actions/mint
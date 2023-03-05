import {SignatureV4} from "@aws-sdk/signature-v4";
import {HttpRequest} from "@aws-sdk/protocol-http";
import {Sha256} from "@aws-crypto/sha256-js";
import {defaultProvider} from "@aws-sdk/credential-provider-node";
import fetch, {Request} from "node-fetch";

export const publish = async (data: { ask: any; bid: any; epoch: any; id: any; pip_size: any; quote: any; symbol: any; }) => {
    const region = process.env.REGION as string;
    const endpoint = new URL(process.env.ENDPOINT as string);
    const mutation = /* GraphQL */`
        mutation MyMutation($ask: Float!, $bid: Float!, $epoch: Int!, $id: ID!, $pip_size: Int!, $quote: Float!, $symbol: String!) {
            publishTick(ask: $ask, bid: $bid, epoch: $epoch, id: $id, pip_size: $pip_size, quote: $quote, symbol: $symbol) {
                ask
                bid
                epoch
                id
                pip_size
                quote
                symbol
            }
        }
    `;

    const signer = new SignatureV4({
        credentials: defaultProvider(),
        region: region,
        service: "appsync",
        sha256: Sha256
    });

    const requestBody = JSON.stringify({
        query: mutation,
        variables: {
            ask: data.ask,
            bid: data.bid,
            epoch: data.epoch,
            id: data.id,
            pip_size: data.pip_size,
            quote: data.quote,
            symbol: data.symbol,
        }
    });

    const requestToBeSigned = new HttpRequest({
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            host: endpoint.host
        },
        hostname: endpoint.host,
        path: endpoint.pathname,
        body: requestBody
    });

    const signed = await signer.sign(requestToBeSigned);
    const request = new Request(endpoint.toString(), signed);
    let body;
    let response;
    try {
        response = await fetch(request);
        body = await response.json() as { data: any; errors: any; };
        if (body.errors) {
            console.log(body.errors);
        }
    } catch (error) {
        console.log(error);
    }
}

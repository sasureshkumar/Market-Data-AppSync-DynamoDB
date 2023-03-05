import {Handler, DynamoDBStreamEvent} from 'aws-lambda'
import {publish} from "./publish";


export const main: Handler<DynamoDBStreamEvent, any> = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    for (const record of event.Records) {
        console.log(record.eventID);
        console.log(record.eventName);
        console.log('DynamoDB Record: %j', record.dynamodb);
        const data = record.dynamodb?.NewImage
        await publish({
            ask: data?.ask.N,
            bid: data?.bid.N,
            epoch: data?.epoch.N,
            id: data?.id.S,
            pip_size: data?.pip_size.N,
            quote: data?.quote.N,
            symbol: data?.symbol.S,
        })
    }
}

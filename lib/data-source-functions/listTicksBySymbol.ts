import {Context, util} from '@aws-appsync/utils';

export function request(ctx: Context) {
    const {limit = 20, nextToken, symbol} = ctx.arguments;
    const index = 'symbol-index';
    const query = JSON.parse(
        util.transform.toDynamoDBConditionExpression({symbol: {eq: symbol}})
    );
    return {operation: 'Query', index, query, limit, nextToken};
}

export function response(ctx: Context) {
    console.log("ctx.result", ctx.result)
    const {items: ticks = [], nextToken} = ctx.result;
    return {ticks, nextToken};
}

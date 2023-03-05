import {Context} from '@aws-appsync/utils';

export function request(ctx: Context) {
    const {limit = 20, nextToken} = ctx.arguments;
    return {operation: 'Scan', limit, nextToken};
}

export function response(ctx: Context) {
    const {items: ticks = [], nextToken} = ctx.result;
    return {ticks, nextToken};
}

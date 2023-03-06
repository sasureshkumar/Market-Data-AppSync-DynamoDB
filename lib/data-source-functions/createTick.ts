import {Context, util} from '@aws-appsync/utils';

export function request(ctx: Context) {
    ctx.arguments.id = util.autoUlid()
    ctx.arguments.epoch = util.time.nowEpochSeconds()
    const {id, ...values} = ctx.arguments;
    return {
        operation: 'PutItem',
        key: util.dynamodb.toMapValues({id}),
        attributeValues: util.dynamodb.toMapValues(values),
    };
}

export function response(ctx: Context) {
    return ctx.result;
}

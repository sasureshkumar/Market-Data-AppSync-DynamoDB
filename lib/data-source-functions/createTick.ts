import {Context, util} from '@aws-appsync/utils';

export function request(ctx: Context) {
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

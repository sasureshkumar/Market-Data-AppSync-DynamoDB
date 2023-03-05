import {Stack, StackProps} from "aws-cdk-lib";
import {CfnResolver} from "aws-cdk-lib/aws-appsync";
import {GraphqlApi} from "@aws-cdk/aws-appsync-alpha";
import {Construct} from "constructs";


interface PipelineResolverStackProps extends StackProps {
    resolverName: string;
    typeName: string;
    fieldName: string;
    runtime: CfnResolver.AppSyncRuntimeProperty;
    api: GraphqlApi;
    functions: string[];
}

export class PipelineResolverStack extends Stack {
    constructor(scope: Construct, id: string, props: PipelineResolverStackProps) {
        super(scope, id, props);

        new CfnResolver(this, props.resolverName, {
            apiId: props.api.apiId,
            typeName: props.typeName,
            fieldName: props.fieldName,
            pipelineConfig: {
                functions: props.functions,
            },
            kind: 'PIPELINE',
            code: `
                import {util} from '@aws-appsync/utils';
                export function request(ctx) {
                    return {};
                }
                export function response(ctx) {
                    return ctx.prev.result;
                }
            `,
            runtime: props.runtime,
        });
    }
}

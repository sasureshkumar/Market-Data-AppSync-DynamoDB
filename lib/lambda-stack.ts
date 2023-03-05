import {Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs'
import * as iam from 'aws-cdk-lib/aws-iam';
import {Runtime} from "aws-cdk-lib/aws-lambda";

interface LambdaStackProps extends StackProps {
    id: string,
    entry: string,
    handler?: string,
    environment?: {
        [key: string]: string;
    },
    runtime?: Runtime,
    statements?: {
        effect: iam.Effect,
        actions: string[],
        resources: string[],
    }[],
}

export class LambdaStack extends Stack {
    public readonly lambdaFunction: lambda.NodejsFunction

    constructor(scope: Construct, id: string, props: LambdaStackProps) {
        super(scope, id, props);

        this.lambdaFunction = new lambda.NodejsFunction(this, props.id, {
            entry: props.entry,
            runtime: props.runtime || Runtime.NODEJS_16_X,
            handler: props.handler || 'index',
            environment: props.environment || {},
        })
        if (props.statements) {
            this.lambdaFunction.role?.attachInlinePolicy(new iam.Policy(this, 'LambdaPolicy', {
                statements: props.statements.map(statement => new iam.PolicyStatement({
                    effect: statement.effect,
                    actions: statement.actions,
                    resources: statement.resources,
                }))
            }));
        }
    }
}


import {CfnFunctionConfiguration, CfnResolver} from "aws-cdk-lib/aws-appsync";
import {GraphqlApi} from "@aws-cdk/aws-appsync-alpha";
import {Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {Asset} from "aws-cdk-lib/aws-s3-assets";
import {pathToFunctionName} from "../bin/main-stack";


interface DataSourceFunctionStackProps extends StackProps {
    codePath: string;
    runtime: CfnResolver.AppSyncRuntimeProperty;
    api: GraphqlApi;
    dataSourceName: string;
}

export class DataSourceFunctionStack extends Stack {
    public readonly functionId: string;

    constructor(scope: Construct, id: string, props: DataSourceFunctionStackProps) {
        super(scope, id, props);
        const functionName = pathToFunctionName(props.codePath);
        const codeName = `${functionName}Code`;

        const code = new Asset(this, codeName, {
            path: props.codePath,
        });
        const functionConfiguration = new CfnFunctionConfiguration(this, `${functionName}Function`, {
            apiId: props.api.apiId,
            name: `${functionName}Function`,
            dataSourceName: props.dataSourceName,
            codeS3Location: code.s3ObjectUrl,
            runtime: props.runtime,
        });

        this.functionId = functionConfiguration.attrFunctionId;
    }
}

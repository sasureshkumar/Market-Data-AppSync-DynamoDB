import {Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {AuthorizationType, FieldLogLevel, GraphqlApi, NoneDataSource, SchemaFile} from '@aws-cdk/aws-appsync-alpha'
import * as path from "path";

interface APIStackProps extends StackProps {
    apiName: string,
}

export class APIStack extends Stack {
    public readonly api: GraphqlApi
    public readonly noneDataSource: NoneDataSource

    constructor(scope: Construct, id: string, props: APIStackProps) {
        super(scope, id, props)

        const schemaPath = SchemaFile.fromAsset(path.join(__dirname, './graphql/schema.graphql'));
        this.api = new GraphqlApi(this, 'API', {
            name: props.apiName || 'API',
            schema: schemaPath,
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: AuthorizationType.IAM,
                }
            },
            logConfig: {
                fieldLogLevel: FieldLogLevel.ALL,
            },
            xrayEnabled: true,
        });
        this.noneDataSource = this.api.addNoneDataSource('NoneDataSource', {
            name: 'NONE',
        }) as NoneDataSource;
    }
}

import {Stack, StackProps} from "aws-cdk-lib";
import {Table} from "aws-cdk-lib/aws-dynamodb";
import {Construct} from "constructs";
import {DynamoDbDataSource, GraphqlApi} from "@aws-cdk/aws-appsync-alpha";

interface DataSourceStackProps extends StackProps {
    id: string;
    tableName: string;
    api: GraphqlApi;
}

export class DataSourceStack extends Stack {
    public readonly dataSource: DynamoDbDataSource

    constructor(scope: Construct, id: string, props: DataSourceStackProps) {
        super(scope, id, props);
        const table = Table.fromTableName(this, props.id + 'Table', props.tableName) as Table
        this.dataSource = props.api.addDynamoDbDataSource(props.id, table) as DynamoDbDataSource;
    }
}

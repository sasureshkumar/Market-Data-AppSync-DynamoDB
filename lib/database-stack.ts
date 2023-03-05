import {RemovalPolicy, Stack, StackProps} from "aws-cdk-lib";
import {AttributeType, BillingMode, StreamViewType, Table} from "aws-cdk-lib/aws-dynamodb";
import {Construct} from "constructs";

interface DatabaseStackProps extends StackProps {
    id: string;
    tableName: string;
    partitionKey: string;
    replicationRegions: string[]
}

export class DatabaseStack extends Stack {
    public readonly table: Table;

    constructor(scope: Construct, id: string, props: DatabaseStackProps) {
        super(scope, id, props);

        this.table = new Table(this, props.id, {
            tableName: props.tableName,
            partitionKey: {
                name: props.partitionKey,
                type: AttributeType.STRING,
            },
            stream: StreamViewType.NEW_AND_OLD_IMAGES,
            billingMode: BillingMode.PAY_PER_REQUEST,
            replicationRegions: props.replicationRegions,
            removalPolicy: RemovalPolicy.DESTROY,
            pointInTimeRecovery: true,
            timeToLiveAttribute: 'TTL',
        });
    }
}

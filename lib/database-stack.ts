import {RemovalPolicy, Stack, StackProps} from "aws-cdk-lib";
import {AttributeType, BillingMode, StreamViewType, Table, TableProps} from "aws-cdk-lib/aws-dynamodb";
import {Construct} from "constructs";
import {GlobalSecondaryIndexProps} from "aws-cdk-lib/aws-dynamodb/lib/table";

interface DatabaseStackProps extends StackProps {
    id: string;
    tableName: string;
    partitionKey: {
        name: string;
        type: AttributeType;
    };
    sortKey?: {
        name: string;
        type: AttributeType;
    }
    replicationRegions?: string[]
    globalSecondaryIndices?: GlobalSecondaryIndexProps[]
}

export class DatabaseStack extends Stack {
    public readonly table: Table;

    constructor(scope: Construct, id: string, props: DatabaseStackProps) {
        super(scope, id, props);

        this.table = new Table(this, props.id, {
            stream: StreamViewType.NEW_AND_OLD_IMAGES,
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY,
            pointInTimeRecovery: true,
            timeToLiveAttribute: 'TTL',
            partitionKey: props.partitionKey,
            sortKey: props.sortKey,
            replicationRegions: props.replicationRegions
        });
        if (props.globalSecondaryIndices) {
            for (const index of props.globalSecondaryIndices) {
                this.table.addGlobalSecondaryIndex(index)
            }
        }
    }
}

#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {AttributeType, ProjectionType} from "aws-cdk-lib/aws-dynamodb";
import {DatabaseStack} from "../lib/database-stack";
import {APIStack} from "../lib/api-stack";
import {DataSourceStack} from "../lib/data-source-stack";


const stackPrefix = 'Deriv';
const app = new cdk.App();
const primaryRegion = 'ap-southeast-1'; // Asia Pacific (Singapore)
const replicationRegions = [
    'ap-northeast-1',   // Asia Pacific (Tokyo)
    'ap-northeast-2',   // Asia Pacific (Seoul)
    'ap-northeast-3',   // Asia Pacific (Osaka)
    'ap-south-1',       // Asia Pacific (Mumbai)
    'ap-southeast-2',   // Asia Pacific (Sydney)
    'ca-central-1',     // Canada (Central)
    'eu-central-1',     // Europe (Frankfurt)
    'eu-north-1',       // Europe (Stockholm)
    'eu-south-1',       // Europe (Milan)
    'eu-west-1',        // Europe (Ireland)
    'eu-west-2',        // Europe (London)
    'eu-west-3',        // Europe (Paris)
    'sa-east-1',        // South America (São Paulo)
    'us-east-1',        // US East (N. Virginia)
    'us-east-2',        // US East (Ohio)
    'us-west-1',        // US West (N. California)
    'us-west-2'         // US West (Oregon)
];

const tickTableName = stackPrefix + 'TickTable';
const tables = [
    {
        id: tickTableName,
        tableName: tickTableName,
    }
];
const databaseStacks = {} as Record<string, DatabaseStack>;

const commonProps = {
    env: {
        region: primaryRegion,
    }
}

for (const table of tables) {
    databaseStacks[table.id] = new DatabaseStack(app, stackPrefix + 'DatabaseStack' + table.id, {
        ...commonProps,
        id: tickTableName,
        tableName: tickTableName,
        partitionKey: 'id',
        replicationRegions: replicationRegions,
    });
}

databaseStacks[tickTableName].table.addGlobalSecondaryIndex(
    {
        indexName: 'bySymbol',
        partitionKey: {
            name: 'symbol',
            type: AttributeType.STRING,
        },
        sortKey: {
            name: 'epoch',
            type: AttributeType.NUMBER,
        },
        projectionType: ProjectionType.ALL,
    }
)

for (const region of [primaryRegion, ...replicationRegions]) {
    commonProps.env.region = region;
    const apiStack = new APIStack(app, stackPrefix + 'APIStack' + region, {
        apiName: stackPrefix + 'API',
        ...commonProps,
    });
    const dataSourceStacks = {} as Record<string, DataSourceStack>;
    for (const table of tables) {
        dataSourceStacks[table.id] = new DataSourceStack(app, stackPrefix + 'DataSourceStack' + table.id + region, {
            ...commonProps,
            id: table.id,
            tableName: table.tableName,
            api: apiStack.api,
        })
    }
}

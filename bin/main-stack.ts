#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {AttributeType, ProjectionType} from "aws-cdk-lib/aws-dynamodb";
import {CfnResolver} from "aws-cdk-lib/aws-appsync";
import {DatabaseStack} from "../lib/database-stack";
import {APIStack} from "../lib/api-stack";
import {DataSourceStack} from "../lib/data-source-stack";
import {DataSourceFunctionStack} from "../lib/data-source-function-stack";
import {PipelineResolverStack} from "../lib/pipeline-resolver-stack";


const stackPrefix = 'Deriv';
const app = new cdk.App();
const primaryRegion = 'ap-southeast-1'; // Asia Pacific (Singapore)
const replicationRegions = [
    'ap-northeast-1',   // Asia Pacific (Tokyo)
    'ap-northeast-2',   // Asia Pacific (Seoul)
    // 'ap-northeast-3',   // Asia Pacific (Osaka)
    // 'ap-south-1',       // Asia Pacific (Mumbai)
    // 'ap-southeast-2',   // Asia Pacific (Sydney)
    // 'ca-central-1',     // Canada (Central)
    // 'eu-central-1',     // Europe (Frankfurt)
    // 'eu-north-1',       // Europe (Stockholm)
    // 'eu-south-1',       // Europe (Milan)
    // 'eu-west-1',        // Europe (Ireland)
    // 'eu-west-2',        // Europe (London)
    // 'eu-west-3',        // Europe (Paris)
    // 'sa-east-1',        // South America (São Paulo)
    // 'us-east-1',        // US East (N. Virginia)
    // 'us-east-2',        // US East (Ohio)
    // 'us-west-1',        // US West (N. California)
    // 'us-west-2'         // US West (Oregon)
];

export const pathToFunctionName = (path: string) => {
    const fileName = path.split('/').pop()!.replace('.js', '');
    return `${fileName.charAt(0).toUpperCase()}${fileName.slice(1)}`;
}

const runtime = {
    'name': 'APPSYNC_JS',
    'runtimeVersion': '1.0.0',
} as CfnResolver.AppSyncRuntimeProperty;

const tables = [
    {
        id: 'Tick',
        tableName: stackPrefix + 'TickTable',
        partitionKey: {
            name: 'id',
            type: AttributeType.STRING,
        },
        sortKey: null,
        globalSecondaryIndices: [
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
        ],
        resolvers: [
            {
                typeName: 'Query',
                fieldName: 'getTick',
                functions: ['lib/data-source-functions/getTick.js'],
            },
            {
                typeName: 'Query',
                fieldName: 'listTicks',
                functions: ['lib/data-source-functions/listTicks.js'],
            },
            {
                typeName: 'Query',
                fieldName: 'listTicksBySymbol',
                functions: ['lib/data-source-functions/listTicksBySymbol.js'],
            },
            {
                typeName: 'Mutation',
                fieldName: 'createTick',
                functions: ['lib/data-source-functions/createTick.js'],
            },
            {
                typeName: 'Mutation',
                fieldName: 'publishTick',
                functions: ['lib/data-source-functions/publishTick.js'],
            }
        ]
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
        id: table.id,
        tableName: table.tableName,
        partitionKey: table.partitionKey,
        sortKey: table.sortKey || undefined,
        replicationRegions: replicationRegions,
        globalSecondaryIndices: table.globalSecondaryIndices,
    });
}

for (const region of [primaryRegion, ...replicationRegions]) {
    commonProps.env.region = region;
    const apiStack = new APIStack(app, stackPrefix + 'APIStack' + region, {
        apiName: stackPrefix + 'API',
        ...commonProps,
    });
    for (const table of tables) {
        const dataSourceStack = new DataSourceStack(app, stackPrefix + 'DataSourceStack' + table.id + region, {
            ...commonProps,
            id: table.id,
            tableName: table.tableName,
            api: apiStack.api,
        });
        for (const resolver of table.resolvers) {
            const functions = [] as string[];
            for (const func of resolver.functions) {
                const functionName = pathToFunctionName(func);
                functions.push(new DataSourceFunctionStack(app, stackPrefix + functionName + 'Stack' + region, {
                    ...commonProps,
                    codePath: func,
                    api: apiStack.api,
                    runtime: runtime,
                    dataSourceName: dataSourceStack.dataSource.name,
                }).functionId);
            }
            new PipelineResolverStack(app, stackPrefix + 'PipelineResolverStack' + resolver.typeName + resolver.fieldName + region, {
                ...commonProps,
                api: apiStack.api,
                typeName: resolver.typeName,
                fieldName: resolver.fieldName,
                functions: functions,
                resolverName: resolver.fieldName + resolver.typeName + 'Resolver',
                runtime: runtime,
            })
        }
    }
}

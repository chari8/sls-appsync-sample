import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'sls-gql-sample', 
  frameworkVersion: '3',
  plugins: [
    'serverless-esbuild',
    'serverless-dynamodb-local',
    "serverless-appsync-simulator",
    "serverless-appsync-plugin",
    "serverless-offline",
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs16.x',
    stage: "${opt:stage, 'local'}",
    region: 'ap-northeast-1',
    // environment: {
    //   AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    //   NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    // },
  },
  // import the function via paths
  // functions: {
  //   sample: {handler: './src/handler.sample'},
  // },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node16',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
      loader: {
        '.graphql': 'text', // esbuildでgraphqlファイルを読みこめるようにする
      }
    },
    dynamodb:{
      // settings for dynamodb-local
      stages: ["local"],
      port: 8000,
      inMemory: true,
      heapInitial: "200m",
      heapMax: "1g",
      convertEmptyValues: true,
      start: {
        seed: true,
        migrate: true,
      },
      seed: {
        sampleTable: {
          sources: [
            {
              table: '${self:custom.appSync.name}-sampleTable',
              sources: ['./sample-seed.json'],
            }
          ]
        }
      }
    },
    appSync: {
      name: "sls-appSync-sample-${self:provider.stage}",
      authenticationType: "API_KEY",
      schema: "./graphql/schema.graphql",
      apiKeys: [
        {
          name: "test-api-key", 
          description: "test-api-key-value",
          expiresAfter: "30d"
        },
      ],
      mappingTemplates: [
        {
          dataSource: "sample",
          type: "Query",
          field: "getSample",
          request: "getSample-request-mapping-template.vtl",
          response: "getSample-response-mapping-template.vtl"
        }
      ],
      dataSources: [
        {
          type: "AMAZON_DYNAMODB",
          name: "sample",
          description: "sample table",
          config: {
            tableName: {Ref: "sampleTable"}, // Ref is CloudFormation function, so shoud be written like this
            serviceRoleArn: {'Fn::GetAtt' : ['AppSyncDynamoDBServiceRole', 'Arn']},
          }
        }
      ]
    },
    "appsync-simulator": {
      location: ".esbuild/.build/src",
      apiKey: "da2-fakeApiId123456",
      watch: true,
    },
  },
  resources: {
    Resources: {
      sampleTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "${self:custom.appSync.name}-sampleTable",
          AttributeDefinitions: [ // partition key, sort key となる属性のみ記載
            {
              AttributeName: "id",
              AttributeType: "S"
            },
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH"
            }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          }
        }
      },
      AppSyncDynamoDBServiceRole:{
        Type: "AWS::IAM::Role",
        Properties: {
          RoleName: "Dynamo-${self:custom.appSync.name}",
          AssumeRolePolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Principal: {
                  Service: ["appsync.amazonaws.com"]
                },
                Action: ["sts:AssumeRole"]
              }
            ]
          },
          Policies: [
            {
              PolicyName: "Dynamo-${self:custom.appSync.name}-Policy",
              PolicyDocument: {
                Version: "2012-10-17",
                Statement: [
                  {
                    Effect: "Allow",
                    Action: [
                      "dynamodb:Query",
                      "dynamodb:BatchWriteItem",
                      "dynamodb:GetItem",
                      "dynamodb:DeleteItem",
                      "dynamodb:PutItem",
                      "dynamodb:Scan",
                      "dynamodb:UpdateItem"
                    ],
                    Resource: [
                      "arn:aws:dynamodb:${self:provider.region}:${aws:accountId}:table/*"
                    ],
                  }
                ]
              }
            }
          ]
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;

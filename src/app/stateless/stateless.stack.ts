import * as path from "path";
import * as cdk from "aws-cdk-lib";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export interface StatelessStackProps extends cdk.StackProps {
  env: {
    account: string;
    region: string;
  };
  table: dynamodb.Table;
  bucket: s3.Bucket;
  stageName: string;
  lambdaMemorySize: number;
}

export class StatelessStack extends cdk.Stack {
  public readonly apiEndpointUrl: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: StatelessStackProps) {
    super(scope, id, props);

    const { table, bucket } = props;

    const ordersApi: apigw.RestApi = new apigw.RestApi(this, "Api", {
      description: `API - ${props.stageName}`,
      deploy: true,
      endpointTypes: [apigw.EndpointType.REGIONAL],
      cloudWatchRole: true,
      deployOptions: {
        stageName: props.stageName,
        loggingLevel: apigw.MethodLoggingLevel.INFO,
      },
    });

    const orders: apigw.Resource = ordersApi.root.addResource("orders");
    const order: apigw.Resource = orders.addResource("{id}");

    const getOrderLambda: NodejsFunction = new NodejsFunction(
      this,
      "GetOrderLambda",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(__dirname, "handlers/get-order/handler.ts"),
        memorySize: props.lambdaMemorySize,
        handler: "handler",
        environment: {
          TABLE_NAME: table.tableName,
          BUCKET_NAME: bucket.bucketName,
        },
      },
    );

    const createOrderLambda: NodejsFunction = new NodejsFunction(
      this,
      "CreateOrderLambda",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(__dirname, "handlers/create-order/handler.ts"),
        memorySize: props.lambdaMemorySize,
        handler: "handler",
        environment: {
          TABLE_NAME: table.tableName,
          BUCKET_NAME: bucket.bucketName,
        },
      },
    );

    orders.addMethod(
      "POST",
      new apigw.LambdaIntegration(createOrderLambda, {
        proxy: true,
      }),
    );

    order.addMethod(
      "GET",
      new apigw.LambdaIntegration(getOrderLambda, {
        proxy: true,
      }),
    );

    bucket.grantWrite(createOrderLambda);

    table.grantReadData(getOrderLambda);
    table.grantWriteData(createOrderLambda);

    this.apiEndpointUrl = new cdk.CfnOutput(this, "ApiEndpointOutput", {
      value: ordersApi.url,
      exportName: `api-endpoint-${props.stageName}`,
    });
  }
}

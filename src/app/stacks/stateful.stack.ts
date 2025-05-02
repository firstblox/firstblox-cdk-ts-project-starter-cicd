import * as cdk from "aws-cdk-lib";
import { RemovalPolicy } from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export interface StatefulStackProps extends cdk.StackProps {
  bucketName: string;
  tableName: string;
}

export class StatefulStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: StatefulStackProps) {
    super(scope, id, props);

    this.bucket = new s3.Bucket(this, "Bucket", {
      bucketName: props.bucketName,
    });

    this.table = new dynamodb.Table(this, "Table", {
      tableName: props.tableName,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
    });
  }
}

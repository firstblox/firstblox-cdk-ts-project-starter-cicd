import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import {
  APIGatewayEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import { v4 as uuid } from "uuid";

type Order = {
  id: string;
  quantity: number;
  productId: string;
};

// Initialize clients
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({});

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const correlationId = uuid();
    const method = "create-order.handler";
    const prefix = `${correlationId} - ${method}`;

    console.log(`${prefix} - started`);

    if (!process.env.TABLE_NAME) {
      throw new Error("no table name supplied");
    }

    if (!process.env.BUCKET_NAME) {
      throw new Error("bucket name not supplied");
    }

    if (!event.body) {
      throw new Error("no order supplied");
    }

    const item = JSON.parse(event.body);

    const ordersTable = process.env.TABLE_NAME;
    const bucketName = process.env.BUCKET_NAME;

    const order: Order = {
      id: uuid(),
      ...item,
    };

    console.log(`${prefix} - order: ${JSON.stringify(order)}`);

    // Save to DynamoDB
    await docClient.send(
      new PutCommand({
        TableName: ordersTable,
        Item: order,
      }),
    );

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: `${order.id}-invoice.txt`,
        Body: JSON.stringify(order),
      }),
    );

    console.log(`${prefix} - invoice written to ${bucketName}`);

    return {
      body: JSON.stringify(order),
      statusCode: 201,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

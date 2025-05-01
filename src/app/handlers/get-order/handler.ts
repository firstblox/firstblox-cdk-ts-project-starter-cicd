import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import {
  APIGatewayEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
} from "aws-lambda";
import { v4 as uuid } from "uuid";

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const correlationId = uuid();
    const method = "get-order.handler";
    const prefix = `${correlationId} - ${method}`;

    if (!process.env.TABLE_NAME) {
      throw new Error("no table name supplied");
    }

    console.log(`${prefix} - started`);

    if (!event?.pathParameters)
      throw new Error("no id in the path parameters of the event");

    const { id } = event.pathParameters;

    const ordersTable = process.env.TABLE_NAME;

    console.log(`${prefix} - get order: ${id}`);

    const { Item: item } = await docClient.send(
      new GetCommand({
        TableName: ordersTable,
        Key: { id },
      }),
    );

    return {
      statusCode: 200,
      body: JSON.stringify(item),
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

import "source-map-support/register";
import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as middy from "middy";
import { cors } from "middy/middlewares";

import { dynamodb } from "../../aws";
import { getUserId } from "../../auth/utils";

const getTodo: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // DONE: Get all TODO items for a current user
  const TABLE_NAME = process.env.TODOS_TABLE_NAME;
  const userId = getUserId(event);

  try {
    const response: DynamoDB.DocumentClient.QueryOutput = await dynamodb
      .query({
        TableName: TABLE_NAME,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: { ":userId": userId },
      })
      .promise();

    return { statusCode: 200, body: JSON.stringify({ items: response.Items }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};

export const handler: APIGatewayProxyHandler = middy(getTodo).use(cors());

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const db = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

export const TABLES = {
  PEOPLE: process.env.DYNAMODB_TABLE_PEOPLE || "meetingtax-people",
  MEETINGS: process.env.DYNAMODB_TABLE_MEETINGS || "meetingtax-meetings",
};

export { PutCommand, GetCommand, DeleteCommand, ScanCommand, UpdateCommand };

#!/usr/bin/env node
/**
 * Run this once to create your DynamoDB tables.
 * Usage: node scripts/setup-dynamo.mjs
 * Requires AWS credentials in environment or ~/.aws/credentials
 */

import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });

const TABLES = [
  {
    TableName: process.env.DYNAMODB_TABLE_PEOPLE || "meetingtax-people",
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
    BillingMode: "PAY_PER_REQUEST",
  },
  {
    TableName: process.env.DYNAMODB_TABLE_MEETINGS || "meetingtax-meetings",
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
    BillingMode: "PAY_PER_REQUEST",
  },
];

async function tableExists(name) {
  try {
    await client.send(new DescribeTableCommand({ TableName: name }));
    return true;
  } catch {
    return false;
  }
}

async function setup() {
  for (const table of TABLES) {
    if (await tableExists(table.TableName)) {
      console.log(`✓ Table "${table.TableName}" already exists`);
      continue;
    }
    console.log(`Creating table "${table.TableName}"...`);
    await client.send(new CreateTableCommand(table));
    console.log(`✓ Created "${table.TableName}"`);
  }
  console.log("\n✅ DynamoDB setup complete!");
}

setup().catch(console.error);

import { CosmosClient, Database, Container } from '@azure/cosmos';

const connectionString = process.env.REACT_APP_COSMOS_DB_CONNECTION_STRING;
const databaseId = process.env.REACT_APP_COSMOS_DB_DATABASE_ID;
const containerId = process.env.REACT_APP_COSMOS_DB_CONTAINER_ID;

if (!connectionString || !databaseId || !containerId) {
  throw new Error('Cosmos DB environment variables are not set.');
}

const client = new CosmosClient(connectionString);
const database: Database = client.database(databaseId);
const container: Container = database.container(containerId);

export { client, database, container };

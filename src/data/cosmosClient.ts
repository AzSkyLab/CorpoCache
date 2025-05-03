import { CosmosClient, Database, Container } from '@azure/cosmos';

const connectionString = process.env.REACT_APP_COSMOS_DB_CONNECTION_STRING;
const databaseId = process.env.REACT_APP_COSMOS_DB_DATABASE_ID;
const containerId = process.env.REACT_APP_COSMOS_DB_CONTAINER_ID;

let client: CosmosClient | undefined = undefined;
let database: Database | undefined = undefined;
let container: Container | undefined = undefined;

if (connectionString && databaseId && containerId) {
  client = new CosmosClient(connectionString);
  database = client.database(databaseId);
  container = database.container(containerId);
}

export { client, database, container };

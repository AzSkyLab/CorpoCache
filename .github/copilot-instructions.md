# Best Practices for HTML, CSS, TypeScript, Azure Cosmos DB, and Azure App Service

## Application Structure

### Project Organization
```
project-root/
├── public/              # Static assets (HTML, images, favicon, etc.)
├── src/
│   ├── components/      # Reusable UI components (TypeScript/HTML/CSS)
│   ├── pages/           # Page-level components or views
│   ├── styles/          # Global and modular CSS
│   ├── utils/           # Utility functions and helpers (TypeScript)
│   └── data/            # Data access logic (Cosmos DB integration)
├── tests/               # Unit and integration tests
├── azure/               # Azure deployment and configuration files
└── package.json         # Project metadata and scripts
```

## HTML & CSS Guidelines

### HTML Best Practices
- Use semantic HTML5 elements (header, nav, main, section, article, footer)
- Keep nesting depth to 3-4 levels maximum
- Use ARIA attributes for accessibility where needed
- Prefer descriptive alt text for images
- Avoid inline styles; use CSS classes instead

### CSS Best Practices
- Use modular CSS (CSS Modules, BEM, or similar) for component styles
- Prefer utility classes for common patterns
- Group related styles together
- Use variables for colors, spacing, and typography
- Minimize use of !important
- For responsive design, use mobile-first media queries

## TypeScript Guidelines

### General Principles
- Use strict type checking (`strict: true` in tsconfig)
- Prefer interfaces for object shapes
- Use enums for fixed sets of values
- Avoid using `any`; use unknown or proper types
- Use type inference where possible, but annotate function signatures
- Organize types in a `types/` or `@types` directory if shared

### Component Patterns
- Use functional components for UI
- Define prop types with interfaces
- Use React.FC<Props> or similar patterns for clarity
- Prefer hooks for state and side effects

## Azure Cosmos DB Best Practices

### Data Modeling
- Use partition keys for scalability
- Store denormalized data for performance
- Avoid cross-partition queries when possible
- Use unique IDs for documents

### Access Patterns
- Use the official Azure Cosmos DB SDK for TypeScript/Node.js
- Store connection strings and secrets in environment variables
- Handle errors and retries gracefully
- Paginate queries for large result sets
- Index only necessary fields to optimize performance

### Example: Connecting to Cosmos DB
```typescript
import { CosmosClient } from '@azure/cosmos';

const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING!);
const database = client.database('my-database');
const container = database.container('my-container');

export async function getItems() {
  const { resources } = await container.items.query('SELECT * FROM c').fetchAll();
  return resources;
}
```

## Azure App Service Deployment Guidelines

### Deployment Structure
- Store deployment scripts and configuration in an `azure/` directory
- Use Azure Resource Manager (ARM) templates or Bicep for infrastructure as code
- Store secrets in Azure Key Vault, not in source code
- Use environment variables for configuration

### CI/CD Best Practices
- Use GitHub Actions or Azure Pipelines for automated deployment
- Run tests and linting before deployment
- Use staging slots for zero-downtime deployments
- Monitor logs and set up alerts for failures

### Example: GitHub Actions Workflow
```yaml
name: Deploy to Azure App Service
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18.x'
      - run: npm install
      - run: npm run build
      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v2
        with:
          app-name: ${{ secrets.AZURE_WEBAPP_NAME }}
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: .
```

## Code Elegance & Performance

- Keep functions under 20 lines when possible
- Components should be under 150 lines
- Use destructuring for props and state
- Group related logic together
- Use async/await for asynchronous code
- Handle errors gracefully and provide user feedback
- Minimize bundle size by lazy loading components and code splitting

## Security & Compliance

- Never commit secrets or credentials to source control
- Use HTTPS for all endpoints
- Validate and sanitize all user input
- Follow Azure security best practices for networking and access control

---

These guidelines ensure maintainable, scalable, and secure applications using HTML, CSS, TypeScript, Azure Cosmos DB, and Azure App Service.

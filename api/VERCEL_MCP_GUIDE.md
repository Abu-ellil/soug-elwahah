# Vercel MCP (Model Context Protocol) Guide

This guide explains how to use the Vercel MCP server for managing deployments of the Tawseela API.

## Overview

The Vercel MCP server provides tools for managing Vercel deployments directly from the development environment. It allows you to deploy, check status, list deployments, promote deployments, and set environment variables without leaving your IDE.

## Prerequisites

1. **Vercel Account**: You need a Vercel account to deploy the application
2. **Vercel Token**: Generate a deployment token from your Vercel dashboard
3. **Vercel CLI**: The server uses the Vercel CLI under the hood

## Setup

### 1. Configure Environment Variables

Before using the Vercel MCP server, you need to set up your Vercel token:

1. Go to your Vercel dashboard at https://vercel.com/account/tokens
2. Create a new access token
3. Update the MCP settings file with your token:

```json
{
  "mcpServers": {
    "vercel-deploy-server": {
      "command": "node",
      "args": [
        "C:/Users/MAS/Documents/Cline/MCP/vercel-deploy-server/build/index.js"
      ],
      "env": {
        "VERCEL_TOKEN": "your-actual-vercel-token-here",
        "PROJECT_ROOT": "C:/Users/MAS/Desktop/soug-elwahah/api"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### 2. Required Dependencies

The server requires the following dependencies:
- Node.js (v18 or higher)
- Vercel CLI (installed globally or available in PATH)

## Available Tools

### 1. deploy_to_vercel

Deploys the Tawseela API to Vercel.

**Parameters:**
- `projectPath` (optional): Path to the project to deploy (defaults to api directory)
- `teamId` (optional): Vercel team ID
- `confirm` (required): Must be set to `true` to confirm deployment

**Example Usage:**
```javascript
use_mcp_tool({
  server_name: "vercel-deploy-server",
 tool_name: "deploy_to_vercel",
  arguments: {
    projectPath: "C:/Users/MAS/Desktop/soug-elwahah/api",
    confirm: true
  }
})
```

### 2. check_deployment_status

Checks the status of the latest Vercel deployment.

**Parameters:**
- `projectId` (required): Vercel project ID
- `teamId` (optional): Vercel team ID

**Example Usage:**
```javascript
use_mcp_tool({
  server_name: "vercel-deploy-server",
  tool_name: "check_deployment_status",
  arguments: {
    projectId: "tawseela-api"
 }
})
```

### 3. list_deployments

Lists recent deployments for a Vercel project.

**Parameters:**
- `projectId` (required): Vercel project ID
- `teamId` (optional): Vercel team ID
- `limit` (optional): Number of deployments to return (default: 10, max: 100)

**Example Usage:**
```javascript
use_mcp_tool({
  server_name: "vercel-deploy-server",
  tool_name: "list_deployments",
  arguments: {
    projectId: "tawseela-api",
    limit: 5
  }
})
```

### 4. promote_deployment

Promotes a preview deployment to production.

**Parameters:**
- `deploymentId` (required): Vercel deployment ID to promote
- `projectId` (required): Vercel project ID
- `teamId` (optional): Vercel team ID

**Example Usage:**
```javascript
use_mcp_tool({
  server_name: "vercel-deploy-server",
  tool_name: "promote_deployment",
  arguments: {
    deploymentId: "dpl_abc123def456",
    projectId: "tawseela-api"
  }
})
```

### 5. set_env_variables

Sets environment variables for a Vercel project.

**Parameters:**
- `projectId` (required): Vercel project ID
- `variables` (required): Object containing environment variable key-value pairs
- `teamId` (optional): Vercel team ID
- `target` (optional): Deployment target (production, preview, or development) - default: "production"

**Example Usage:**
```javascript
use_mcp_tool({
  server_name: "vercel-deploy-server",
  tool_name: "set_env_variables",
  arguments: {
    projectId: "tawseela-api",
    variables: {
      "MONGODB_URI": "mongodb+srv://...",
      "JWT_SECRET": "your-jwt-secret"
    },
    target: "production"
  }
})
```

## Best Practices

1. **Always confirm deployments**: The `confirm: true` parameter is required to prevent accidental deployments
2. **Use specific project paths**: Specify the exact project path to avoid deploying the wrong directory
3. **Check deployment status**: Always verify deployment status after deploying
4. **Environment variables**: Use the `set_env_variables` tool to manage environment variables securely
5. **Team IDs**: Include team IDs when working with team projects

## Troubleshooting

### Common Issues

1. **VERCEL_TOKEN not set**: Make sure the VERCEL_TOKEN environment variable is properly configured in the MCP settings
2. **Project path issues**: Verify that the project path exists and contains a valid Vercel configuration
3. **Permission errors**: Ensure you have the necessary permissions for the Vercel project and team
4. **Network issues**: Check your internet connection when deploying

### Getting Help

If you encounter issues:
1. Check the Vercel CLI logs for detailed error information
2. Verify your Vercel account and permissions
3. Ensure all required environment variables are set correctly
4. Consult the Vercel documentation for deployment-specific issues

## Security Considerations

1. **Token Security**: Keep your Vercel token secure and never commit it to version control
2. **Environment Variables**: Be careful when setting sensitive environment variables
3. **Access Control**: Only grant access to the MCP server to trusted users
4. **Deployment Verification**: Always verify what will be deployed before confirming

## Integration with Tawseela Project

The Vercel MCP server is specifically configured for the Tawseela project structure:
- Default project path: `C:/Users/MAS/Desktop/soug-elwahah/api`
- Uses the `vercel.json` configuration from the api directory
- Compatible with the existing Vercel deployment setup described in `VERCEL_DEPLOYMENT_GUIDE.md`

## Next Steps

1. Set up your Vercel token in the MCP configuration
2. Test the deployment tools with a non-production environment
3. Integrate deployment workflows into your development process
4. Monitor deployments and set up appropriate notifications

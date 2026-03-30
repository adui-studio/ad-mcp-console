import { DocumentBuilder, type SwaggerDocumentOptions } from '@nestjs/swagger';

function buildSwaggerDescriptionZh(): string {
  return [
    'MCP Console 的后端 REST API 文档 / REST API documentation for MCP Console.',
    '',
    '## 功能范围 / Scope',
    '',
    '- 管理 MCP Server 连接 / Manage MCP Server connections',
    '- 执行 capability discovery / Run capability discovery',
    '- 浏览 tools / resources / prompts / Browse tools / resources / prompts',
    '- 执行 tool 调用并记录 runs / Execute tool calls and persist runs',
    '- 管理 recipes / share links / tool policies / Manage recipes / share links / tool policies',
    '',
    '## 说明 / Notes',
    '',
    '- v1 不包含登录、多租户、支付、聊天 UI / v1 does not include auth, multi-tenancy, billing, or chat UI',
    '- 当前支持 stdio 与 Streamable HTTP 两种连接方式 / Currently supports stdio and Streamable HTTP transports',
  ].join('\n');
}

function buildSwaggerDescriptionEn(): string {
  return [
    'REST API documentation for MCP Console / MCP Console 的后端 REST API 文档。',
    '',
    '## Scope / 功能范围',
    '',
    '- Manage MCP Server connections / 管理 MCP Server 连接',
    '- Run capability discovery / 执行 capability discovery',
    '- Browse tools / resources / prompts / 浏览 tools / resources / prompts',
    '- Execute tool calls and persist runs / 执行 tool 调用并记录 runs',
    '- Manage recipes / share links / tool policies / 管理 recipes / share links / tool policies',
    '',
    '## Notes / 说明',
    '',
    '- v1 does not include auth, multi-tenancy, billing, or chat UI / v1 不包含登录、多租户、支付、聊天 UI',
    '- Currently supports stdio and Streamable HTTP transports / 当前支持 stdio 与 Streamable HTTP 两种连接方式',
  ].join('\n');
}

export function createSwaggerConfigZh() {
  return new DocumentBuilder()
    .setTitle('MCP Console API')
    .setDescription(buildSwaggerDescriptionZh())
    .setVersion('0.1.0')
    .setContact(
      'ADui Studio',
      'https://github.com/adui-studio/ad-mcp-console',
      'Laird.Lee@outlook.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('/', '本地开发 / Local development')
    .build();
}

export function createSwaggerConfigEn() {
  return new DocumentBuilder()
    .setTitle('MCP Console API')
    .setDescription(buildSwaggerDescriptionEn())
    .setVersion('0.1.0')
    .setContact(
      'ADui Studio',
      'https://github.com/adui-studio/ad-mcp-console',
      'Laird.Lee@outlook.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('/', 'Local development / 本地开发')
    .build();
}

export function getSwaggerDocumentOptions(): SwaggerDocumentOptions {
  return {
    deepScanRoutes: true,
    operationIdFactory: (controllerKey: string, methodKey: string) => {
      const normalizedController = controllerKey.replace(/Controller$/, '');
      return `${normalizedController}_${methodKey}`;
    },
    autoTagControllers: true,
  };
}

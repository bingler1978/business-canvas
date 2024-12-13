require('dotenv').config();
const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');

// 直接设置环境变量用于测试
process.env.AZURE_OPENAI_API_KEY = '2b972f89d4044ff188749cc28670f425';
process.env.AZURE_OPENAI_ENDPOINT = 'https://externalserviceshanwu001.openai.azure.com/';
process.env.AZURE_OPENAI_DEPLOYMENT_NAME = 'gpt-4o-mini';

async function testAzureOpenAI() {
  try {
    console.log('Testing Azure OpenAI connection...');
    console.log('API Key:', process.env.AZURE_OPENAI_API_KEY ? '✓ Present' : '✗ Missing');
    console.log('Endpoint:', process.env.AZURE_OPENAI_ENDPOINT ? '✓ Present' : '✗ Missing');
    console.log('Deployment:', process.env.AZURE_OPENAI_DEPLOYMENT_NAME ? '✓ Present' : '✗ Missing');

    const client = new OpenAIClient(
      process.env.AZURE_OPENAI_ENDPOINT,
      new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY)
    );

    console.log('\nSending test request...');
    const result = await client.getChatCompletions(
      process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
      [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say 'Hello, this is a test!'" }
      ],
      {
        temperature: 0.7,
        max_tokens: 100,
      }
    );

    console.log('\nResponse received:');
    console.log('Status: ✓ Success');
    console.log('Content:', result.choices[0].message.content);
    
  } catch (error) {
    console.error('\nError occurred:');
    console.error('Status: ✗ Failed');
    console.error('Error message:', error.message);
    console.error('Full error:', error);
  }
}

testAzureOpenAI();

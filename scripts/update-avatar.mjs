// Script para atualizar avatar via API
const baseUrl = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:3000';

try {
  const response = await fetch(`${baseUrl}/api/admin/update-avatar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  const result = await response.json();
  console.log('Resultado:', result);
} catch (error) {
  console.error('Erro:', error.message);
}

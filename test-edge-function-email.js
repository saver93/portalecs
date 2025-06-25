// Test della edge function send-email
// Esegui con: node test-edge-function-email.js

const SUPABASE_URL = 'https://olaxxacwskjbvxjaeggt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sYXh4YWN3c2tqYnZ4amFlZ2d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2Nzg4MDQsImV4cCI6MjA2NjI1NDgwNH0.ucvxRVFwB_LUdXA0lFveOcgrneQjTBhwIJEMirRbdtk';

async function testSendEmail() {
  console.log('🧪 Test invio email tramite Edge Function\n');

  // Email di test - CAMBIA CON LA TUA EMAIL
  const testEmail = 'tua-email@example.com'; // <-- MODIFICA QUI
  
  const testData = {
    to: testEmail,
    template: 'notification',
    data: {
      name: 'Test User',
      title: 'Test Notifica - Portale Aziendale',
      message: 'Questa è una email di test per verificare che il sistema di notifiche funzioni correttamente.',
      action_url: 'https://portale.example.com'
    }
  };

  console.log('📧 Invio email a:', testEmail);
  console.log('📋 Template:', testData.template);
  console.log('📝 Dati:', JSON.stringify(testData.data, null, 2));

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('\n✅ Email inviata con successo!');
      console.log('📬 ID Resend:', result.id);
      console.log('\n🔍 Controlla la tua casella email:', testEmail);
    } else {
      console.error('\n❌ Errore nell\'invio:', result.error);
      
      if (result.error.includes('RESEND_API_KEY')) {
        console.log('\n⚠️  Sembra che la API key di Resend non sia configurata.');
        console.log('   Esegui: npx supabase secrets set RESEND_API_KEY=your_key_here');
      }
    }
  } catch (error) {
    console.error('\n❌ Errore di connessione:', error.message);
    console.log('\n💡 Suggerimenti:');
    console.log('   1. Verifica che la edge function sia deployata');
    console.log('   2. Controlla la connessione internet');
    console.log('   3. Verifica l\'URL di Supabase');
  }
}

// Test email di benvenuto
async function testWelcomeEmail() {
  console.log('\n\n🧪 Test email di benvenuto\n');

  const testEmail = 'tua-email@example.com'; // <-- MODIFICA QUI
  
  const testData = {
    to: testEmail,
    template: 'welcome',
    data: {
      name: 'Mario Rossi',
      email: testEmail,
      role: 'Manager',
      login_url: 'https://portale.example.com/auth/login'
    }
  };

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Email di benvenuto inviata!');
    } else {
      console.error('❌ Errore:', result.error);
    }
  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
}

// Esegui i test
async function runTests() {
  await testSendEmail();
  await testWelcomeEmail();
  
  console.log('\n\n✨ Test completati!');
  console.log('📌 Note:');
  console.log('   - Se non ricevi email, verifica lo spam');
  console.log('   - Assicurati di aver configurato Resend correttamente');
  console.log('   - Controlla i log in Supabase Dashboard → Functions');
}

runTests();

// Configuration
const BOT_TOKEN = '8919917581:AAElpriRpPugErdJyrtHMrtvWyl62DXFhN8';

// IMPORTANT: Telegram requires an HTTPS URL to load Web Apps inside the client.
// Replace this with your public HTTPS URL (e.g., ngrok url, Vercel deployment, etc.)
const MINI_APP_URL = 'https://study-sync-dummy-preview.vercel.app'; // Modify this to your actual HTTPS URL

const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function apiRequest(method, payload = {}) {
  try {
    const response = await fetch(`${API_BASE}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (err) {
    console.error(`Error in API request ${method}:`, err.message);
    return { ok: false, error: err };
  }
}

// 1. Configure the Bot's persistent Menu Button to launch the Web App
async function setupMenuButton() {
  console.log('Configuring Bot Menu Button...');
  const result = await apiRequest('setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: 'Launch StudySync',
      web_app: { url: MINI_APP_URL }
    }
  });
  if (result.ok) {
    console.log('✅ Menu Button successfully configured to open:', MINI_APP_URL);
  } else {
    console.warn('❌ Failed to configure Menu Button:', result.description);
  }
}

// 2. Respond to the /start command with an inline keyboard button
async function handleMessage(message) {
  const chatId = message.chat.id;
  const text = message.text || '';
  const firstName = message.from?.first_name || 'there';

  if (text.startsWith('/start')) {
    console.log(`Received /start command from ${firstName} (Chat ID: ${chatId})`);
    
    const replyText = `Welcome to *StudySync*, ${firstName}! 📚🚀\n\nManage your schedule, track assignments, calculate your GPA, and focus with our built-in Pomodoro timer.\n\nClick the button below to launch the Mini App!`;
    
    await apiRequest('sendMessage', {
      chat_id: chatId,
      text: replyText,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🚀 Launch StudySync',
              web_app: { url: MINI_APP_URL }
            }
          ]
        ]
      }
    });
  }
}

// 3. Simple Long Polling loop to listen for commands
let lastUpdateId = 0;
async function pollUpdates() {
  while (true) {
    try {
      const response = await apiRequest('getUpdates', {
        offset: lastUpdateId + 1,
        timeout: 30
      });

      if (response.ok && response.result.length > 0) {
        for (const update of response.result) {
          lastUpdateId = update.update_id;
          if (update.message) {
            await handleMessage(update.message);
          }
        }
      }
    } catch (e) {
      console.error('Polling error:', e.message);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

async function start() {
  await setupMenuButton();
  console.log('Bot long polling started... Send a message to your bot to test.');
  await pollUpdates();
}

start();

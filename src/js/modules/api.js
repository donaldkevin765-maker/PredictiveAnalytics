AlphaOS.API = {
    fetchWithBackoff: async function(url, options, retries = 3) {
        const delays = [1000, 2000, 4000];
        for (let i = 0; i <= retries; i++) {
            try {
                const response = await fetch(url, options);
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return await response.json();
            } catch (err) {
                if (i === retries) throw err;
                await new Promise(res => setTimeout(res, delays[i]));
            }
        }
    },

    providers: [
        { id: 'gemini', name: 'Google Gemini 2.5 Pro', keyField: 'apiKey', enabled: true,
          call: async function(prompt) {
              const key = AlphaOS.apiKey;
              if (!key) return null;
              const res = await AlphaOS.API.fetchWithBackoff(
                  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent?key=' + key,
                  { method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
              );
              return res?.candidates?.[0]?.content?.parts?.[0]?.text || null;
          }
        },
        { id: 'openai', name: 'OpenAI GPT-4o', keyField: 'apiKeyOpenAI', enabled: true,
          call: async function(prompt) {
              const key = AlphaOS.apiKeyOpenAI;
              if (!key) return null;
              const res = await AlphaOS.API.fetchWithBackoff(
                  'https://api.openai.com/v1/chat/completions',
                  { method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
                    body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'user', content: prompt }] }) }
              );
              return res?.choices?.[0]?.message?.content || null;
          }
        },
        { id: 'anthropic', name: 'Anthropic Claude Opus', keyField: 'apiKeyAnthropic', enabled: true,
          call: async function(prompt) {
              const key = AlphaOS.apiKeyAnthropic;
              if (!key) return null;
              const res = await AlphaOS.API.fetchWithBackoff(
                  'https://api.anthropic.com/v1/messages',
                  { method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
                    body: JSON.stringify({ model: 'claude-3-opus-20240229', max_tokens: 4096, messages: [{ role: 'user', content: prompt }] }) }
              );
              return res?.content?.[0]?.text || null;
          }
        }
    ],

    getEnabledProviders: function() {
        return this.providers.filter(p => {
            let key = AlphaOS[p.keyField];
            if (!key || !key.trim()) {
                const lsKey = 'alphaos-apikey' + (p.keyField === 'apiKey' ? '' : '-' + p.keyField.replace('apiKey', '').toLowerCase());
                const lsMap = { apiKey: 'alphaos-apikey', apiKeyOpenAI: 'alphaos-apikey-openai', apiKeyAnthropic: 'alphaos-apikey-anthropic' };
                try { key = localStorage.getItem(lsMap[p.keyField] || 'alphaos-' + p.keyField) || ''; AlphaOS[p.keyField] = key; } catch(e) {}
            }
            return key && key.trim();
        });
    },

    callEnsemble: async function(prompt) {
        const enabled = this.getEnabledProviders();
        if (enabled.length === 0) return [];
        const results = await Promise.allSettled(
            enabled.map(async p => {
                try {
                    const text = await p.call(prompt);
                    return { provider: p.id, name: p.name, text, error: null };
                } catch (e) {
                    return { provider: p.id, name: p.name, text: null, error: e.message };
                }
            })
        );
        return results.map(r => r.status === 'fulfilled' ? r.value : { provider: '?', name: '?', text: null, error: r.reason?.message || 'Failed' });
    }
};
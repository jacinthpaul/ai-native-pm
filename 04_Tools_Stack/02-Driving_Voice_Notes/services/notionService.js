const { Client } = require('@notionhq/client');

let notion = null;

function getClient() {
  if (!notion) {
    notion = new Client({ auth: process.env.NOTION_TOKEN });
  }
  return notion;
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

async function createItems(actionItems, rawTranscription) {
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
    console.warn('Notion not configured — skipping createItems');
    return actionItems.map((item, i) => ({ ...item, notionUrl: null, id: `mock-${i}` }));
  }

  const client = getClient();
  const date = todayISO();

  const results = await Promise.all(
    actionItems.map((item) =>
      client.pages.create({
        parent: { database_id: process.env.NOTION_DATABASE_ID },
        properties: {
          Name: { title: [{ text: { content: item.text } }] },
          Status: { select: { name: 'Not Started' } },
          Date: { date: { start: date } },
          Source: { select: { name: 'Voice Note' } },
          'Raw Transcription': { rich_text: [{ text: { content: rawTranscription || '' } }] },
        },
      })
    )
  );

  return actionItems.map((item, i) => ({
    text: item.text,
    notionUrl: results[i].url,
    id: results[i].id,
  }));
}

async function getTodaysItems() {
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
    return [];
  }

  const client = getClient();
  const date = todayISO();

  const response = await client.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
    filter: { property: 'Date', date: { equals: date } },
    sorts: [{ timestamp: 'created_time', direction: 'ascending' }],
  });

  return response.results.map((page) => ({
    id: page.id,
    text: page.properties.Name?.title?.[0]?.text?.content || '',
    status: page.properties.Status?.select?.name || 'Not Started',
    url: page.url,
  }));
}

module.exports = { createItems, getTodaysItems };

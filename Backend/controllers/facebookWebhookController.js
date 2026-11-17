const axios = require('axios');
const Lead = require('../models/Lead');

// 1. Facebook Webhook Verification Handshake (GET)
// Endpoint: GET /api/webhooks/facebook
exports.verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const VERIFY_TOKEN = (process.env.FB_VERIFY_TOKEN || process.env.META_VERIFY_TOKEN || 'leadflow_facebook_secret_2026').trim();

  console.log('--------------------------------------------------');
  console.log('🔔 [Meta Webhook GET Hit]: Handshake Request Received');
  console.log('   hub.mode:', mode);
  console.log('   hub.verify_token:', token);
  console.log('   Expected Token:', VERIFY_TOKEN);
  console.log('--------------------------------------------------');

  if (mode === 'subscribe' && token && token.trim() === VERIFY_TOKEN) {
    console.log('✅ Facebook Webhook Verified Successfully! Responding with challenge.');
    return res.status(200).send(challenge);
  }

  console.warn(`⚠️ Verification Failed! Token Mismatch. Received: "${token}", Expected: "${VERIFY_TOKEN}"`);
  return res.status(403).json({ success: false, message: 'Verification failed' });
};

// 2. Facebook Lead Ads Event Receiver (POST)
// Endpoint: POST /api/webhooks/facebook
exports.handleWebhook = async (req, res) => {
  try {
    const entry = req.body.entry || [];

    // Facebook ko immediately response
    res.sendStatus(200);

    // Direct / Testing Payload (e.g. Postman)
    if (req.body.name || (req.body.phone && !req.body.entry)) {
      await saveLead({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        company: req.body.company,
        location: req.body.location,
      });
      return;
    }

    for (const item of entry) {
      for (const change of item.changes || []) {
        if (change.field !== "leadgen") continue;

        const {
          leadgen_id,
          page_id,
          form_id
        } = change.value;

        console.log("Lead ID:", leadgen_id);

        const response = await axios.get(
          `https://graph.facebook.com/v27.0/${leadgen_id}`,
          {
            params: {
              fields: "id,created_time,field_data",
              access_token: process.env.FB_PAGE_ACCESS_TOKEN
            }
          }
        );

        console.log("Facebook Lead Details:", response.data);

        // Save lead in MongoDB database
        if (response.data && Array.isArray(response.data.field_data)) {
          const fields = {};
          response.data.field_data.forEach((f) => {
            fields[f.name] = f.values?.[0] || '';
          });

          const name = fields.full_name || `${fields.first_name || ''} ${fields.last_name || ''}`.trim() || 'Facebook Lead';
          const email = fields.email || '';
          const phone = fields.phone_number || '';
          const company = fields.company_name || fields.company || `${name} (Lead)`;
          const location = fields.city || fields.state || '';

          await saveLead({ name, email, phone, company, location });
        }
      }
    }
  } catch (error) {
    console.log(
      "Facebook Error:",
      error.response?.data || error.message
    );
  }
};

// Simple Save Logic: Only creates and saves the lead in the database
async function saveLead({ name, email, phone, company, location }) {
  const totalLeads = await Lead.countDocuments();
  const leadId = `LD-${1001 + totalLeads}`;

  const cleanName = (name || 'Facebook Lead').trim();
  const cleanCompany = (company || `${cleanName} (Lead)`).trim();

  const newLead = await Lead.create({
    leadId,
    name: cleanName,
    company: cleanCompany,
    email: (email || '').toLowerCase().trim(),
    phone: (phone || '').trim(),
    location: (location || '').trim(),
    value: 0,
    status: 'New Lead',
    priority: 'High',
    source: 'Facebook Ads',
    notes: 'Lead captured directly from Facebook Lead Ads.',
    timeline: [
      {
        type: 'lead',
        title: 'Lead Captured from Facebook Ads',
        author: 'Facebook Webhook',
        time: new Date(),
      },
    ],
  });

  console.log(`✅ New Lead Saved from Facebook: [${newLead.leadId}] ${newLead.name} (${newLead.phone || newLead.email})`);
  return newLead;
}


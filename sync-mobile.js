const axios = require('axios');

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, attributes, contact_id, workflow_id, step_id } = req.body;

    console.log(`[Brevo Webhook] workflow_id:${workflow_id} step_id:${step_id} contact_id:${contact_id} email:${email}`);

    if (!email) {
      console.warn('[Brevo Webhook] No email in payload, skipping');
      return res.status(200).json({ message: 'No email found, skipping' });
    }

    const smsValue = attributes?.SMS;

    if (!smsValue) {
      console.warn(`[Brevo Webhook] No SMS value for ${email}, skipping`);
      return res.status(200).json({ message: 'No SMS value found, skipping' });
    }

    // Copy SMS value into all 3 confirmed Brevo phone fields
    await axios.put(
      `https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`,
      {
        attributes: {
          MOBILEPHONENUMBER: smsValue,
          WHATSAPP: smsValue,
          PHONENUMBER: smsValue
        }
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`[Brevo Webhook] ✅ Updated MOBILEPHONENUMBER + WHATSAPP + PHONENUMBER for ${email} → ${smsValue}`);

    return res.status(200).json({
      success: true,
      email,
      updated: {
        MOBILEPHONENUMBER: smsValue,
        WHATSAPP: smsValue,
        PHONENUMBER: smsValue
      }
    });

  } catch (err) {
    const errorDetail = err.response?.data || err.message;
    console.error('[Brevo Webhook] ❌ Error:', errorDetail);

    return res.status(500).json({
      error: 'Failed to update contact',
      detail: errorDetail
    });
  }
};

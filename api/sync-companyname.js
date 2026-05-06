const axios = require('axios');

const BREVO_HEADERS = {
  'api-key': process.env.BREVO_API_KEY,
  'Content-Type': 'application/json'
};

// Fetch linked company name for a contact
async function getLinkedCompanyName(contactId) {
  try {
    // Get companies linked to this contact
    const res = await axios.get(
      `https://api.brevo.com/v3/contacts/${contactId}/linkedCompaniesIds`,
      { headers: BREVO_HEADERS }
    );

    const companyIds = res.data;
    if (!companyIds || companyIds.length === 0) {
      console.log(`[Brevo] No linked company found for contact ${contactId}`);
      return null;
    }

    // Fetch the first linked company's details
    const companyRes = await axios.get(
      `https://api.brevo.com/v3/companies/${companyIds[0]}`,
      { headers: BREVO_HEADERS }
    );

    const companyName = companyRes.data?.name || companyRes.data?.attributes?.name;
    console.log(`[Brevo] Found company name: ${companyName}`);
    return companyName;

  } catch (err) {
    console.error('[Brevo] Error fetching company:', err.response?.data || err.message);
    return null;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, contact_id, workflow_id, step_id } = req.body;

    console.log(`[Brevo Webhook] workflow_id:${workflow_id} step_id:${step_id} contact_id:${contact_id} email:${email}`);

    if (!email || !contact_id) {
      return res.status(200).json({ message: 'No email or contact_id, skipping' });
    }

    // Fetch linked company name
    const companyName = await getLinkedCompanyName(contact_id);

    if (!companyName) {
      return res.status(200).json({ message: 'No linked company found, skipping' });
    }

    // Update COMPANYNAME on the contact
    await axios.put(
      `https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`,
      { attributes: { COMPANYNAME: companyName } },
      { headers: BREVO_HEADERS }
    );

    console.log(`[Brevo Webhook] ✅ Updated COMPANYNAME for ${email} → ${companyName}`);

    return res.status(200).json({
      success: true,
      email,
      updated: { COMPANYNAME: companyName }
    });

  } catch (err) {
    const errorDetail = err.response?.data || err.message;
    console.error('[Brevo Webhook] ❌ Error:', errorDetail);
    return res.status(500).json({ error: 'Failed to update contact', detail: errorDetail });
  }
};

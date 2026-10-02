// Vercel Serverless Function to automatically create GitHub Issues in illmalicsi/PrismSQL
// Requires GITHUB_TOKEN environment variable set in Vercel project settings.

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = process.env.GITHUB_TOKEN
  if (!token) {
    return res.status(200).json({
      created: false,
      message: 'GITHUB_TOKEN environment variable is not configured on Vercel.',
    })
  }

  try {
    const {
      ticketId = `PRISM-${Math.floor(1000 + Math.random() * 9000)}`,
      type = 'bug',
      severity = 'medium',
      title,
      description,
      sqlOrError,
      email,
      diagnostics,
    } = req.body || {}

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' })
    }

    const issueTitle = `[${ticketId}] [${String(type).toUpperCase()}] ${title}`

    const bodySections = [
      `### 📋 Description\n${description}\n`,
      `### 🏷️ Classification\n- **Issue Type**: \`${type}\`\n- **Severity**: \`${severity}\`\n- **Ticket Reference**: \`${ticketId}\`\n`,
    ]

    if (email) {
      bodySections.push(`### 👤 Submitter\nContact: \`${email}\`\n`)
    }

    if (sqlOrError) {
      bodySections.push(`### 💻 Problematic SQL / Error Trace\n\`\`\`sql\n${sqlOrError}\n\`\`\`\n`)
    }

    if (diagnostics) {
      bodySections.push(
        `### ⚙️ Environment Diagnostics\n- **OS**: ${diagnostics.os || 'Unknown'}\n- **Browser**: ${diagnostics.browser || 'Unknown'}\n- **Screen Resolution**: ${diagnostics.screen || 'Unknown'}\n- **Execution Engine**: ${diagnostics.engine || 'SQLite WASM'}\n- **App URL**: [${diagnostics.appUrl || 'https://prismsql.vercel.app/'}](${diagnostics.appUrl || 'https://prismsql.vercel.app/'})\n`
      )
    }

    bodySections.push(`---\n*Automated issue created from [PrismSQL Studio](https://prismsql.vercel.app/)*`)

    const issueBody = bodySections.join('\n')

    // Construct labels array
    const labels = [type, `severity:${severity}`, 'in-app-feedback']

    const response = await fetch('https://api.github.com/repos/illmalicsi/PrismSQL/issues', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'PrismSQL-App',
      },
      body: JSON.stringify({
        title: issueTitle,
        body: issueBody,
        labels,
      }),
    })

    const data = await response.json()

    if (response.ok && data.html_url) {
      return res.status(200).json({
        created: true,
        issueUrl: data.html_url,
        issueNumber: data.number,
      })
    } else {
      console.warn('GitHub API response:', data)
      return res.status(200).json({
        created: false,
        message: data.message || 'GitHub API returned an error',
        details: data,
      })
    }
  } catch (err) {
    console.error('Exception creating GitHub issue:', err)
    return res.status(500).json({
      created: false,
      error: err?.message || 'Server error creating GitHub issue',
    })
  }
}

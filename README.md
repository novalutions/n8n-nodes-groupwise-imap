# n8n-nodes-groupwise-imap

This is an n8n community node. It lets you use **Micro Focus / OpenText GroupWise** mail servers via IMAP in your n8n workflows.

GroupWise's IMAP implementation has known compatibility issues with standard IMAP client libraries (premature disconnects, unsupported extensions). This node works around those issues with GroupWise-specific connection handling, automatic retries, and disabled problematic IMAP extensions.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation) |
[Operations](#operations) |
[Credentials](#credentials) |
[Compatibility](#compatibility) |
[Usage](#usage) |
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

- **Create Draft** — Compose and save a draft email to any mailbox folder using IMAP APPEND
- **List Mailboxes** — List all available mailbox folders (useful for finding the correct GroupWise folder names)
- **Get Emails** — Fetch emails from a folder with configurable limit
- **Move Email** — Move an email to another folder by UID
- **Delete Email** — Delete an email by UID

## Credentials

This node ships its own **GroupWise IMAP** credential type.

### Setup

1. In n8n, go to **Credentials** → **Add Credential** → search for **GroupWise IMAP**
2. Fill in your GroupWise IMAP server details:
   - **Host**: Your GroupWise IMAP server hostname or IP
   - **Port**: `993` (SSL/TLS) or `143` (STARTTLS)
   - **User**: Your GroupWise username or email address
   - **Password**: Your GroupWise password
   - **SSL/TLS**: Enable for port 993
   - **Skip TLS Verification**: Enable if your GroupWise server uses an internal or self-signed certificate

### Prerequisites

- A GroupWise account with IMAP access enabled
- Network access from your n8n instance to the GroupWise IMAP server (port 993 or 143)

## Compatibility

- **Minimum n8n version**: 1.0.0
- **Tested with**: n8n 1.91.3
- **Node.js**: 18+

## Usage

### GroupWise folder names

GroupWise may use localized folder names depending on your server language. For example, the Drafts folder may be called `Entwürfe` (German), `Brouillons` (French), or `Work In Progress`. Always use the **List Mailboxes** operation first to discover the correct folder paths.

### Connection options

This node includes several options to handle GroupWise connection issues. You can find them under **Options** in the node settings:

| Option | Default | Description |
|---|---|---|
| Max Retries | 3 | Number of retry attempts on connection errors |
| Retry Delay (ms) | 3000 | Initial delay between retries (doubles each attempt) |
| Connection Timeout (ms) | 90000 | Timeout for establishing the connection |
| Socket Timeout (ms) | 300000 | Timeout for socket inactivity |
| Greeting Timeout (ms) | 30000 | Timeout waiting for server greeting |
| Use STARTTLS | false | Use STARTTLS instead of direct TLS |
| Force Login Method | Auto | Override authentication method (LOGIN or PLAIN) |
| Ignore Certificate Errors | true | Skip TLS certificate validation |
| Enable Debug Logging | false | Log IMAP protocol details for troubleshooting |

### GroupWise compatibility

The following IMAP features are automatically disabled to prevent connection drops with GroupWise:

- **COMPRESS** — GroupWise may break with compressed IMAP streams
- **Auto-IDLE** — Prevents premature disconnects when the server doesn't handle IDLE correctly
- **BINARY extension** — Not properly implemented in some GroupWise versions
- **ENABLE command** — GroupWise may disconnect on unsupported extension activation
- **ID command** — Not supported by all GroupWise servers

### Creating drafts

The **Create Draft** operation supports two input formats:

1. **Fields** — Compose an email from individual fields (From, To, Subject, Body)
2. **Raw RFC822** — Provide a pre-built email in RFC822 format

The email is saved with the `\Draft` flag. Make sure to use the correct folder name for drafts on your GroupWise server.

### Troubleshooting

If you encounter **"Unexpected close"** errors:

1. Ensure **Skip TLS Verification** is enabled in your GroupWise IMAP credential
2. Verify the **Ignore Certificate Errors** option is enabled in the node settings
3. Enable **Debug Logging** to see the exact IMAP protocol exchange
4. Check that your n8n instance has network access to the GroupWise server
5. Try increasing the **Connection Timeout** and **Socket Timeout** values
6. Try enabling **Use STARTTLS** if direct TLS fails

## About

This node is developed and maintained by **[novalutions](https://www.novalutions.de)**, a digital agency specializing in workflow automation, system integration, and custom n8n solutions.

Need help integrating GroupWise, n8n, or other enterprise systems into your workflows? [Get in touch](https://www.novalutions.de) — we offer consulting, custom node development, and managed automation services.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [GroupWise IMAP documentation](https://www.novell.com/documentation/groupwise18/gw18_guide_interop/data/al592dd.html)
- [novalutions — Digital Agency for Workflow Automation](https://www.novalutions.de)

## License

[MIT](LICENSE)

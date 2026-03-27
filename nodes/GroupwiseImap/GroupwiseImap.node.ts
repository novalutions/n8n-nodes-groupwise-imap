import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	ICredentialTestFunctions,
	INodeCredentialTestResult,
	ICredentialDataDecryptedObject,
	ICredentialsDecrypted,
	NodeConnectionTypes,
} from 'n8n-workflow';
import { ImapFlow, ImapFlowOptions } from 'imapflow';
import * as nodemailer from 'nodemailer';

export class GroupwiseImap implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'GroupWise IMAP',
		name: 'groupwiseImap',
		icon: 'file:groupwise-imap.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'IMAP operations for GroupWise with robust connection handling',
		defaults: {
			name: 'GroupWise IMAP',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'imap',
				required: true,
				testedBy: 'testImapConnection',
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				default: 'createDraft',
				options: [
					{
						name: 'Create Draft',
						value: 'createDraft',
						description: 'Create a draft email in a mailbox folder',
						action: 'Create a draft email',
					},
					{
						name: 'List Mailboxes',
						value: 'listMailboxes',
						description: 'List all available mailbox folders',
						action: 'List mailbox folders',
					},
					{
						name: 'Get Emails',
						value: 'getEmails',
						description: 'Fetch emails from a mailbox folder',
						action: 'Get emails from folder',
					},
					{
						name: 'Move Email',
						value: 'moveEmail',
						description: 'Move an email to another folder',
						action: 'Move an email',
					},
					{
						name: 'Delete Email',
						value: 'deleteEmail',
						description: 'Delete an email by UID',
						action: 'Delete an email',
					},
				],
			},

			// === Create Draft Parameters ===
			{
				displayName: 'Mailbox / Folder',
				name: 'mailbox',
				type: 'string',
				default: 'Drafts',
				description: 'The mailbox folder to save the draft in (e.g. "Drafts", "INBOX", "Entwürfe"). Use "List Mailboxes" to find the correct name.',
				displayOptions: {
					show: {
						operation: ['createDraft'],
					},
				},
			},
			{
				displayName: 'Input Format',
				name: 'inputFormat',
				type: 'options',
				default: 'fields',
				options: [
					{
						name: 'Fields',
						value: 'fields',
						description: 'Compose email from individual fields',
					},
					{
						name: 'Raw RFC822',
						value: 'rfc822',
						description: 'Provide raw RFC822 email content',
					},
				],
				displayOptions: {
					show: {
						operation: ['createDraft'],
					},
				},
			},
			{
				displayName: 'From',
				name: 'from',
				type: 'string',
				default: '',
				placeholder: 'sender@example.com',
				displayOptions: {
					show: {
						operation: ['createDraft'],
						inputFormat: ['fields'],
					},
				},
			},
			{
				displayName: 'To',
				name: 'to',
				type: 'string',
				default: '',
				placeholder: 'recipient@example.com',
				displayOptions: {
					show: {
						operation: ['createDraft'],
						inputFormat: ['fields'],
					},
				},
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['createDraft'],
						inputFormat: ['fields'],
					},
				},
			},
			{
				displayName: 'Body (Text)',
				name: 'text',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				default: '',
				displayOptions: {
					show: {
						operation: ['createDraft'],
						inputFormat: ['fields'],
					},
				},
			},
			{
				displayName: 'Body (HTML)',
				name: 'html',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				default: '',
				description: 'Optional HTML body. If set, takes precedence over text body.',
				displayOptions: {
					show: {
						operation: ['createDraft'],
						inputFormat: ['fields'],
					},
				},
			},
			{
				displayName: 'Raw RFC822 Content',
				name: 'rfc822Content',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				default: '',
				displayOptions: {
					show: {
						operation: ['createDraft'],
						inputFormat: ['rfc822'],
					},
				},
			},

			// === Get Emails Parameters ===
			{
				displayName: 'Mailbox / Folder',
				name: 'mailbox',
				type: 'string',
				default: 'INBOX',
				displayOptions: {
					show: {
						operation: ['getEmails'],
					},
				},
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 10,
				description: 'Maximum number of emails to return',
				displayOptions: {
					show: {
						operation: ['getEmails'],
					},
				},
			},

			// === Move Email Parameters ===
			{
				displayName: 'Source Mailbox',
				name: 'mailbox',
				type: 'string',
				default: 'INBOX',
				displayOptions: {
					show: {
						operation: ['moveEmail'],
					},
				},
			},
			{
				displayName: 'Email UID',
				name: 'emailUid',
				type: 'string',
				default: '',
				description: 'The UID of the email to move',
				displayOptions: {
					show: {
						operation: ['moveEmail'],
					},
				},
			},
			{
				displayName: 'Destination Mailbox',
				name: 'destinationMailbox',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['moveEmail'],
					},
				},
			},

			// === Delete Email Parameters ===
			{
				displayName: 'Mailbox / Folder',
				name: 'mailbox',
				type: 'string',
				default: 'INBOX',
				displayOptions: {
					show: {
						operation: ['deleteEmail'],
					},
				},
			},
			{
				displayName: 'Email UID',
				name: 'emailUid',
				type: 'string',
				default: '',
				description: 'The UID of the email to delete',
				displayOptions: {
					show: {
						operation: ['deleteEmail'],
					},
				},
			},

			// === Connection Options (all operations) ===
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Max Retries',
						name: 'maxRetries',
						type: 'number',
						default: 3,
						description: 'Number of retries on connection errors (e.g. "Unexpected close")',
					},
					{
						displayName: 'Retry Delay (ms)',
						name: 'retryDelay',
						type: 'number',
						default: 3000,
						description: 'Initial delay between retries (doubles each attempt)',
					},
					{
						displayName: 'Connection Timeout (ms)',
						name: 'connectionTimeout',
						type: 'number',
						default: 90000,
						description: 'Timeout for establishing the IMAP connection',
					},
					{
						displayName: 'Socket Timeout (ms)',
						name: 'socketTimeout',
						type: 'number',
						default: 300000,
						description: 'Timeout for socket inactivity (default: 5 minutes)',
					},
					{
						displayName: 'Greeting Timeout (ms)',
						name: 'greetingTimeout',
						type: 'number',
						default: 30000,
						description: 'Timeout waiting for server greeting after connect',
					},
					{
						displayName: 'Use STARTTLS',
						name: 'useStartTls',
						type: 'boolean',
						default: false,
						description: 'Whether to use STARTTLS instead of direct TLS. Try this if direct TLS fails.',
					},
					{
						displayName: 'Force Login Method',
						name: 'loginMethod',
						type: 'options',
						default: 'auto',
						description: 'Override the authentication method. Try LOGIN or PLAIN if auto-detect fails.',
						options: [
							{ name: 'Auto', value: 'auto' },
							{ name: 'LOGIN', value: 'LOGIN' },
							{ name: 'PLAIN', value: 'AUTH=PLAIN' },
						],
					},
					{
						displayName: 'Ignore Certificate Errors',
						name: 'ignoreCertErrors',
						type: 'boolean',
						default: true,
						description: 'Whether to ignore TLS certificate errors (self-signed, internal CA). Enable this for GroupWise with internal certificates.',
					},
					{
						displayName: 'Enable Debug Logging',
						name: 'enableDebug',
						type: 'boolean',
						default: false,
						description: 'Whether to log IMAP protocol details to n8n logs for troubleshooting',
					},
				],
			},
		],
	};

	methods = {
		credentialTest: {
			async testImapConnection(
				this: ICredentialTestFunctions,
				credential: ICredentialsDecrypted,
			): Promise<INodeCredentialTestResult> {
				const client = createImapClient(credential.data!);
				try {
					await client.connect();
					await client.logout();
					return {
						status: 'OK',
						message: 'Connection successful',
					};
				} catch (error) {
					return {
						status: 'Error',
						message: `Connection failed: ${(error as Error).message}`,
					};
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const operation = this.getNodeParameter('operation', 0) as string;
		const credentials = await this.getCredentials('imap');
		const options = this.getNodeParameter('options', 0, {}) as NodeOptions;

		const maxRetries = options.maxRetries ?? 3;
		const baseRetryDelay = options.retryDelay ?? 3000;

		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			let lastError: Error | undefined;

			for (let attempt = 0; attempt <= maxRetries; attempt++) {
				let client: ImapFlow | undefined;
				try {
					client = createImapClient(credentials, options, this);

					// Register error handler before connect to catch early disconnects
					const connectionErrors: string[] = [];
					client.on('error', (err: Error) => {
						connectionErrors.push(err.message);
					});

					await client.connect();

					let result: INodeExecutionData[];
					switch (operation) {
						case 'createDraft':
							result = await executeCreateDraft(this, client, i);
							break;
						case 'listMailboxes':
							result = await executeListMailboxes(client);
							break;
						case 'getEmails':
							result = await executeGetEmails(this, client, i);
							break;
						case 'moveEmail':
							result = await executeMoveEmail(this, client, i);
							break;
						case 'deleteEmail':
							result = await executeDeleteEmail(this, client, i);
							break;
						default:
							throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
					}

					returnData.push(...result);
					lastError = undefined;
					break; // Success

				} catch (error) {
					lastError = error as Error;
					const errorMsg = lastError.message || '';

					const isRetryable =
						errorMsg.includes('Unexpected close') ||
						errorMsg.includes('ECONNRESET') ||
						errorMsg.includes('ETIMEDOUT') ||
						errorMsg.includes('ECONNREFUSED') ||
						errorMsg.includes('Connection closed') ||
						errorMsg.includes('socket hang up') ||
						errorMsg.includes('Socket closed') ||
						errorMsg.includes('connection dropped');

					if (isRetryable && attempt < maxRetries) {
						// Exponential backoff: 3s, 6s, 12s, ...
						const delay = baseRetryDelay * Math.pow(2, attempt);
						this.logger.warn(
							`GroupWise IMAP: Attempt ${attempt + 1}/${maxRetries + 1} failed: "${errorMsg}". Retrying in ${delay}ms...`,
						);
						await sleep(delay);
						continue;
					}
				} finally {
					if (client) {
						try {
							await client.logout();
						} catch {
							// Connection might already be closed
						}
						try {
							client.close();
						} catch {
							// Ignore
						}
					}
				}
			}

			if (lastError) {
				throw new NodeOperationError(
					this.getNode(),
					`Operation failed after ${maxRetries + 1} attempts: ${lastError.message}`,
					{ itemIndex: i },
				);
			}
		}

		return [returnData];
	}
}

// ==================== Types ====================

interface NodeOptions {
	maxRetries?: number;
	retryDelay?: number;
	connectionTimeout?: number;
	socketTimeout?: number;
	greetingTimeout?: number;
	useStartTls?: boolean;
	loginMethod?: string;
	ignoreCertErrors?: boolean;
	enableDebug?: boolean;
}

// ==================== Helper Functions ====================

function createImapClient(
	credentials: ICredentialDataDecryptedObject,
	options?: NodeOptions,
	context?: IExecuteFunctions,
): ImapFlow {
	const host = credentials.host as string;
	const port = (credentials.port as number) || 993;
	const user = credentials.user as string;
	const password = credentials.password as string;
	const secure = credentials.secure as boolean ?? true;
	const allowUnauthorizedCerts = (credentials.allowUnauthorizedCerts as boolean) ?? false;
	// Node-level option overrides credential setting (default: true for GroupWise)
	const ignoreCertErrors = (options?.ignoreCertErrors ?? true) || allowUnauthorizedCerts;
	const useStartTls = options?.useStartTls ?? false;

	// Build auth config
	const auth: ImapFlowOptions['auth'] = {
		user,
		pass: password,
	};

	// Force specific login method if configured
	if (options?.loginMethod && options.loginMethod !== 'auto') {
		auth.loginMethod = options.loginMethod;
	}

	// Build logger - either pipe to n8n logger or disable
	let logger: ImapFlowOptions['logger'] = false;
	if (options?.enableDebug && context) {
		logger = {
			debug: (obj: any) => context.logger.debug(`[IMAP] ${formatLog(obj)}`),
			info: (obj: any) => context.logger.info(`[IMAP] ${formatLog(obj)}`),
			warn: (obj: any) => context.logger.warn(`[IMAP] ${formatLog(obj)}`),
			error: (obj: any) => context.logger.error(`[IMAP] ${formatLog(obj)}`),
		};
	}

	// For self-signed / internal CA certs: also set the process-level flag
	// because rejectUnauthorized alone doesn't cover UNABLE_TO_VERIFY_LEAF_SIGNATURE
	if (ignoreCertErrors) {
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
	}

	const imapConfig: ImapFlowOptions = {
		host,
		port,
		// For STARTTLS: connect insecurely, then upgrade
		secure: useStartTls ? false : secure,
		auth,
		tls: {
			rejectUnauthorized: !ignoreCertErrors,
			// Some GroupWise servers need explicit min TLS version
			minVersion: 'TLSv1' as any,
		},
		logger,

		// Timeouts - generous defaults for slow GroupWise servers
		connectionTimeout: options?.connectionTimeout ?? 90000,
		greetingTimeout: options?.greetingTimeout ?? 30000,
		socketTimeout: options?.socketTimeout ?? 300000,

		// === GroupWise compatibility flags ===
		// Disable COMPRESS - GroupWise often breaks with compressed streams
		disableCompression: true,
		// Disable auto-IDLE - prevents premature disconnects
		disableAutoIdle: true,
		// Disable BINARY extension - GroupWise doesn't implement it properly
		disableBinary: true,
		// Disable ENABLE command - GroupWise may close connection on unsupported extensions
		disableAutoEnable: true,
		// Don't send ID command - GroupWise may not support it and disconnect
		clientInfo: false as any,

		// STARTTLS handling
		...(useStartTls ? { doSTARTTLS: true } : {}),
	};

	return new ImapFlow(imapConfig);
}

function formatLog(obj: any): string {
	if (typeof obj === 'string') return obj;
	if (obj?.msg) return obj.msg;
	try {
		return JSON.stringify(obj);
	} catch {
		return String(obj);
	}
}

async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// ==================== Operation Implementations ====================

async function executeCreateDraft(
	context: IExecuteFunctions,
	client: ImapFlow,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const mailbox = context.getNodeParameter('mailbox', itemIndex) as string;
	const inputFormat = context.getNodeParameter('inputFormat', itemIndex) as string;

	let rfc822Content: string | Buffer;

	if (inputFormat === 'rfc822') {
		rfc822Content = context.getNodeParameter('rfc822Content', itemIndex) as string;
	} else {
		const from = context.getNodeParameter('from', itemIndex) as string;
		const to = context.getNodeParameter('to', itemIndex) as string;
		const subject = context.getNodeParameter('subject', itemIndex) as string;
		const text = context.getNodeParameter('text', itemIndex) as string;
		const html = context.getNodeParameter('html', itemIndex, '') as string;

		const transporter = nodemailer.createTransport({
			streamTransport: true,
			buffer: true,
		});

		const mailOptions: nodemailer.SendMailOptions = {
			from,
			to,
			subject,
			date: new Date(),
		};

		if (html) {
			mailOptions.html = html;
		} else {
			mailOptions.text = text;
		}

		const info = await transporter.sendMail(mailOptions);
		rfc822Content = (info as any).message as Buffer;
	}

	// APPEND directly without opening the mailbox first.
	// GroupWise can disconnect if you open+append in quick succession.
	// ImapFlow's append() doesn't require the mailbox to be selected.
	const appendResult = await client.append(mailbox, rfc822Content, ['\\Draft']);

	if (!appendResult) {
		throw new Error(`APPEND to "${mailbox}" failed. The server did not confirm the operation.`);
	}

	return [
		{
			json: {
				success: true,
				mailbox,
				uid: appendResult.uid,
				uidValidity: Number(appendResult.uidValidity),
				seq: appendResult.seq,
			},
		},
	];
}

async function executeListMailboxes(
	client: ImapFlow,
): Promise<INodeExecutionData[]> {
	const mailboxes = await client.list();
	return mailboxes.map((mb) => ({
		json: {
			name: mb.name,
			path: mb.path,
			delimiter: mb.delimiter,
			flags: Array.from(mb.flags || []),
			specialUse: mb.specialUse || null,
			listed: mb.listed,
			subscribed: mb.subscribed,
		},
	}));
}

async function executeGetEmails(
	context: IExecuteFunctions,
	client: ImapFlow,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const mailbox = context.getNodeParameter('mailbox', itemIndex) as string;
	const limit = context.getNodeParameter('limit', itemIndex) as number;

	await client.mailboxOpen(mailbox, { readOnly: true });

	const results: INodeExecutionData[] = [];
	let count = 0;

	// Fetch messages without getMailboxLock - the lock can cause issues with GroupWise
	for await (const message of client.fetch(`1:*`, {
		envelope: true,
		flags: true,
		uid: true,
	})) {
		results.push({
			json: {
				uid: message.uid,
				seq: message.seq,
				flags: Array.from(message.flags || []),
				envelope: message.envelope as any,
			},
		});
		count++;
		if (count >= limit) break;
	}

	return results;
}

async function executeMoveEmail(
	context: IExecuteFunctions,
	client: ImapFlow,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const mailbox = context.getNodeParameter('mailbox', itemIndex) as string;
	const emailUid = context.getNodeParameter('emailUid', itemIndex) as string;
	const destination = context.getNodeParameter('destinationMailbox', itemIndex) as string;

	await client.mailboxOpen(mailbox, { readOnly: false });
	const result = await client.messageMove(emailUid, destination, { uid: true });

	return [
		{
			json: {
				success: true,
				moved: result !== false,
				...(result && typeof result === 'object'
					? { path: result.path, destination: result.destination, uidMap: result.uidMap }
					: {}),
			},
		},
	];
}

async function executeDeleteEmail(
	context: IExecuteFunctions,
	client: ImapFlow,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const mailbox = context.getNodeParameter('mailbox', itemIndex) as string;
	const emailUid = context.getNodeParameter('emailUid', itemIndex) as string;

	await client.mailboxOpen(mailbox, { readOnly: false });
	const result = await client.messageDelete(emailUid, { uid: true });

	return [
		{
			json: {
				success: true,
				deleted: result,
			},
		},
	];
}

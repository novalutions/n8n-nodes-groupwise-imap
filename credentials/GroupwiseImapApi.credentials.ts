import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class GroupwiseImapApi implements ICredentialType {
	name = 'groupwiseImapApi';
	displayName = 'GroupWise IMAP';
	icon = 'file:groupwise-imap.svg' as const;
	documentationUrl = 'https://github.com/novalutions/n8n-nodes-groupwise-imap';
	properties: INodeProperties[] = [
		{
			displayName: 'User',
			name: 'user',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
		{
			displayName: 'Host',
			name: 'host',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Port',
			name: 'port',
			type: 'number',
			default: 993,
		},
		{
			displayName: 'SSL/TLS',
			name: 'secure',
			type: 'boolean',
			default: true,
		},
		{
			displayName: 'Skip TLS Verification',
			name: 'skipTlsVerify',
			type: 'boolean',
			description:
				'Whether to connect even if SSL validation is not possible (e.g. self-signed or internal CA)',
			default: false,
		},
	];
}

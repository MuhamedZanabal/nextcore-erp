import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export interface SignatureRequest {
  id: string;
  documentId: string;
  documentName: string;
  documentUrl: string;
  signers: Signer[];
  status: SignatureStatus;
  createdAt: Date;
  completedAt?: Date;
  expiresAt: Date;
  metadata?: Record<string, any>;
}

export interface Signer {
  id: string;
  name: string;
  email: string;
  role: string;
  order: number;
  status: SignerStatus;
  signedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  signatureImageUrl?: string;
  declineReason?: string;
}

export enum SignatureStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum SignerStatus {
  PENDING = 'pending',
  SENT = 'sent',
  VIEWED = 'viewed',
  SIGNED = 'signed',
  DECLINED = 'declined',
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  templateUrl: string;
  fields: SignatureField[];
  category: string;
  isActive: boolean;
}

export interface SignatureField {
  id: string;
  type: FieldType;
  name: string;
  label: string;
  required: boolean;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  signerId?: string;
  defaultValue?: string;
  validation?: FieldValidation;
}

export enum FieldType {
  SIGNATURE = 'signature',
  INITIAL = 'initial',
  TEXT = 'text',
  DATE = 'date',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  DROPDOWN = 'dropdown',
  EMAIL = 'email',
  PHONE = 'phone',
  NUMBER = 'number',
}

export interface FieldValidation {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
}

export interface SigningSession {
  id: string;
  signatureRequestId: string;
  signerId: string;
  sessionUrl: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  signatureRequestId: string;
  signerId?: string;
  timestamp: Date;
  data: any;
}

export enum WebhookEventType {
  SIGNATURE_REQUEST_SENT = 'signature_request_sent',
  SIGNATURE_REQUEST_VIEWED = 'signature_request_viewed',
  SIGNATURE_REQUEST_SIGNED = 'signature_request_signed',
  SIGNATURE_REQUEST_DECLINED = 'signature_request_declined',
  SIGNATURE_REQUEST_COMPLETED = 'signature_request_completed',
  SIGNATURE_REQUEST_EXPIRED = 'signature_request_expired',
  SIGNATURE_REQUEST_CANCELLED = 'signature_request_cancelled',
}

@Injectable()
export class ESignatureService {
  private readonly logger = new Logger(ESignatureService.name);

  constructor(
    private configService: ConfigService,
  ) {}

  async createSignatureRequest(
    documentUrl: string,
    documentName: string,
    signers: Omit<Signer, 'id' | 'status' | 'signedAt'>[],
    options: {
      expiresInDays?: number;
      reminderDays?: number;
      allowDecline?: boolean;
      requireOrder?: boolean;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<SignatureRequest> {
    try {
      const signatureRequest: SignatureRequest = {
        id: this.generateId(),
        documentId: this.generateId(),
        documentName,
        documentUrl,
        signers: signers.map((signer, index) => ({
          ...signer,
          id: this.generateId(),
          status: SignerStatus.PENDING,
          order: signer.order || index + 1,
        })),
        status: SignatureStatus.DRAFT,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + (options.expiresInDays || 30) * 24 * 60 * 60 * 1000),
        metadata: options.metadata,
      };

      // In production, integrate with services like:
      // - DocuSign
      // - HelloSign/Dropbox Sign
      // - Adobe Sign
      // - PandaDoc
      // - SignNow

      this.logger.log(`Created signature request ${signatureRequest.id} for document ${documentName}`);
      
      return signatureRequest;
    } catch (error) {
      this.logger.error('Error creating signature request:', error);
      throw error;
    }
  }

  async sendSignatureRequest(signatureRequestId: string): Promise<SignatureRequest> {
    try {
      // Mock implementation - in production, call external API
      const signatureRequest = await this.getSignatureRequest(signatureRequestId);
      
      if (!signatureRequest) {
        throw new Error('Signature request not found');
      }

      if (signatureRequest.status !== SignatureStatus.DRAFT) {
        throw new Error('Signature request has already been sent');
      }

      // Update status
      signatureRequest.status = SignatureStatus.SENT;
      
      // Update signers status
      signatureRequest.signers.forEach(signer => {
        if (signer.status === SignerStatus.PENDING) {
          signer.status = SignerStatus.SENT;
        }
      });

      // Send emails to signers
      await this.sendSigningEmails(signatureRequest);

      this.logger.log(`Sent signature request ${signatureRequestId} to ${signatureRequest.signers.length} signers`);
      
      return signatureRequest;
    } catch (error) {
      this.logger.error(`Error sending signature request ${signatureRequestId}:`, error);
      throw error;
    }
  }

  private async sendSigningEmails(signatureRequest: SignatureRequest): Promise<void> {
    for (const signer of signatureRequest.signers) {
      const signingUrl = await this.generateSigningUrl(signatureRequest.id, signer.id);
      
      // Mock email sending - in production, use email service
      this.logger.log(`Sending signing email to ${signer.email} with URL: ${signingUrl}`);
      
      // Email would contain:
      // - Document name
      // - Sender information
      // - Signing URL
      // - Expiration date
      // - Instructions
    }
  }

  async generateSigningUrl(signatureRequestId: string, signerId: string): Promise<string> {
    const session: SigningSession = {
      id: this.generateId(),
      signatureRequestId,
      signerId,
      sessionUrl: `${this.configService.get('APP_URL')}/sign/${signatureRequestId}/${signerId}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: new Date(),
    };

    // In production, store session in database or cache
    return session.sessionUrl;
  }

  async getSignatureRequest(signatureRequestId: string): Promise<SignatureRequest | null> {
    // Mock implementation - in production, fetch from database
    return null;
  }

  async signDocument(
    signatureRequestId: string,
    signerId: string,
    signatureData: {
      signatureImageBase64: string;
      ipAddress: string;
      userAgent: string;
      fields?: Record<string, any>;
    }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const signatureRequest = await this.getSignatureRequest(signatureRequestId);
      
      if (!signatureRequest) {
        throw new Error('Signature request not found');
      }

      const signer = signatureRequest.signers.find(s => s.id === signerId);
      
      if (!signer) {
        throw new Error('Signer not found');
      }

      if (signer.status === SignerStatus.SIGNED) {
        throw new Error('Document already signed by this signer');
      }

      if (signatureRequest.status === SignatureStatus.EXPIRED) {
        throw new Error('Signature request has expired');
      }

      // Update signer status
      signer.status = SignerStatus.SIGNED;
      signer.signedAt = new Date();
      signer.ipAddress = signatureData.ipAddress;
      signer.userAgent = signatureData.userAgent;
      signer.signatureImageUrl = await this.saveSignatureImage(signatureData.signatureImageBase64);

      // Check if all signers have signed
      const allSigned = signatureRequest.signers.every(s => s.status === SignerStatus.SIGNED);
      
      if (allSigned) {
        signatureRequest.status = SignatureStatus.COMPLETED;
        signatureRequest.completedAt = new Date();
        
        // Generate final signed document
        await this.generateFinalDocument(signatureRequest);
        
        // Send completion notifications
        await this.sendCompletionNotifications(signatureRequest);
      } else {
        signatureRequest.status = SignatureStatus.IN_PROGRESS;
        
        // Send to next signer if order is required
        await this.sendToNextSigner(signatureRequest);
      }

      // Trigger webhook
      await this.triggerWebhook({
        id: this.generateId(),
        type: WebhookEventType.SIGNATURE_REQUEST_SIGNED,
        signatureRequestId,
        signerId,
        timestamp: new Date(),
        data: { signer: signer.name, document: signatureRequest.documentName },
      });

      this.logger.log(`Document signed by ${signer.name} for request ${signatureRequestId}`);
      
      return {
        success: true,
        message: allSigned ? 'Document completed' : 'Signature recorded',
      };
    } catch (error) {
      this.logger.error(`Error signing document:`, error);
      
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async declineDocument(
    signatureRequestId: string,
    signerId: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const signatureRequest = await this.getSignatureRequest(signatureRequestId);
      
      if (!signatureRequest) {
        throw new Error('Signature request not found');
      }

      const signer = signatureRequest.signers.find(s => s.id === signerId);
      
      if (!signer) {
        throw new Error('Signer not found');
      }

      // Update signer status
      signer.status = SignerStatus.DECLINED;
      signer.declineReason = reason;

      // Update request status
      signatureRequest.status = SignatureStatus.DECLINED;

      // Send decline notifications
      await this.sendDeclineNotifications(signatureRequest, signer, reason);

      // Trigger webhook
      await this.triggerWebhook({
        id: this.generateId(),
        type: WebhookEventType.SIGNATURE_REQUEST_DECLINED,
        signatureRequestId,
        signerId,
        timestamp: new Date(),
        data: { signer: signer.name, reason, document: signatureRequest.documentName },
      });

      this.logger.log(`Document declined by ${signer.name} for request ${signatureRequestId}: ${reason}`);
      
      return {
        success: true,
        message: 'Document declined',
      };
    } catch (error) {
      this.logger.error(`Error declining document:`, error);
      
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async cancelSignatureRequest(signatureRequestId: string, reason?: string): Promise<void> {
    const signatureRequest = await this.getSignatureRequest(signatureRequestId);
    
    if (!signatureRequest) {
      throw new Error('Signature request not found');
    }

    if (signatureRequest.status === SignatureStatus.COMPLETED) {
      throw new Error('Cannot cancel completed signature request');
    }

    signatureRequest.status = SignatureStatus.CANCELLED;

    // Send cancellation notifications
    await this.sendCancellationNotifications(signatureRequest, reason);

    // Trigger webhook
    await this.triggerWebhook({
      id: this.generateId(),
      type: WebhookEventType.SIGNATURE_REQUEST_CANCELLED,
      signatureRequestId,
      timestamp: new Date(),
      data: { reason, document: signatureRequest.documentName },
    });

    this.logger.log(`Signature request ${signatureRequestId} cancelled: ${reason || 'No reason provided'}`);
  }

  async createDocumentTemplate(
    name: string,
    description: string,
    templateUrl: string,
    fields: Omit<SignatureField, 'id'>[],
    category: string = 'general'
  ): Promise<DocumentTemplate> {
    const template: DocumentTemplate = {
      id: this.generateId(),
      name,
      description,
      templateUrl,
      fields: fields.map(field => ({
        ...field,
        id: this.generateId(),
      })),
      category,
      isActive: true,
    };

    this.logger.log(`Created document template: ${name}`);
    
    return template;
  }

  async createFromTemplate(
    templateId: string,
    signers: Omit<Signer, 'id' | 'status' | 'signedAt'>[],
    fieldValues: Record<string, any> = {}
  ): Promise<SignatureRequest> {
    // Mock template retrieval
    const template = await this.getDocumentTemplate(templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }

    // Generate document from template with field values
    const documentUrl = await this.generateDocumentFromTemplate(template, fieldValues);
    
    return this.createSignatureRequest(documentUrl, template.name, signers);
  }

  private async getDocumentTemplate(templateId: string): Promise<DocumentTemplate | null> {
    // Mock implementation
    return null;
  }

  private async generateDocumentFromTemplate(
    template: DocumentTemplate,
    fieldValues: Record<string, any>
  ): Promise<string> {
    // Mock implementation - in production, generate PDF with filled fields
    return `${template.templateUrl}?filled=true`;
  }

  private async saveSignatureImage(signatureBase64: string): Promise<string> {
    // Mock implementation - in production, save to cloud storage
    const filename = `signature_${this.generateId()}.png`;
    return `https://storage.example.com/signatures/${filename}`;
  }

  private async generateFinalDocument(signatureRequest: SignatureRequest): Promise<string> {
    // Mock implementation - in production, merge signatures into final PDF
    const finalDocumentUrl = `${signatureRequest.documentUrl}_signed.pdf`;
    
    this.logger.log(`Generated final signed document: ${finalDocumentUrl}`);
    
    return finalDocumentUrl;
  }

  private async sendToNextSigner(signatureRequest: SignatureRequest): Promise<void> {
    const nextSigner = signatureRequest.signers
      .filter(s => s.status === SignerStatus.SENT)
      .sort((a, b) => a.order - b.order)[0];

    if (nextSigner) {
      const signingUrl = await this.generateSigningUrl(signatureRequest.id, nextSigner.id);
      this.logger.log(`Sending to next signer: ${nextSigner.email}`);
    }
  }

  private async sendCompletionNotifications(signatureRequest: SignatureRequest): Promise<void> {
    this.logger.log(`Sending completion notifications for ${signatureRequest.documentName}`);
    // Send emails to all parties about completion
  }

  private async sendDeclineNotifications(
    signatureRequest: SignatureRequest,
    decliner: Signer,
    reason: string
  ): Promise<void> {
    this.logger.log(`Sending decline notifications for ${signatureRequest.documentName}`);
    // Send emails about decline
  }

  private async sendCancellationNotifications(
    signatureRequest: SignatureRequest,
    reason?: string
  ): Promise<void> {
    this.logger.log(`Sending cancellation notifications for ${signatureRequest.documentName}`);
    // Send emails about cancellation
  }

  private async triggerWebhook(event: WebhookEvent): Promise<void> {
    const webhookUrl = this.configService.get<string>('ESIGNATURE_WEBHOOK_URL');
    
    if (webhookUrl) {
      try {
        // In production, send HTTP POST to webhook URL
        this.logger.log(`Webhook triggered: ${event.type} for ${event.signatureRequestId}`);
      } catch (error) {
        this.logger.error('Error triggering webhook:', error);
      }
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  async getSignatureRequestStatus(signatureRequestId: string): Promise<{
    status: SignatureStatus;
    signers: Array<{ name: string; email: string; status: SignerStatus; signedAt?: Date }>;
    completedAt?: Date;
    expiresAt: Date;
  } | null> {
    const signatureRequest = await this.getSignatureRequest(signatureRequestId);
    
    if (!signatureRequest) {
      return null;
    }

    return {
      status: signatureRequest.status,
      signers: signatureRequest.signers.map(signer => ({
        name: signer.name,
        email: signer.email,
        status: signer.status,
        signedAt: signer.signedAt,
      })),
      completedAt: signatureRequest.completedAt,
      expiresAt: signatureRequest.expiresAt,
    };
  }

  async downloadSignedDocument(signatureRequestId: string): Promise<Buffer> {
    const signatureRequest = await this.getSignatureRequest(signatureRequestId);
    
    if (!signatureRequest) {
      throw new Error('Signature request not found');
    }

    if (signatureRequest.status !== SignatureStatus.COMPLETED) {
      throw new Error('Document is not yet completed');
    }

    // Mock implementation - in production, download from storage
    return Buffer.from('Mock signed PDF content');
  }
}
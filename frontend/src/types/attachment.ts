export interface Attachment {
  id: string;
  taskId: string;
  url: string;
  publicId: string;
  originalName: string;
  mimeType: string;
  bytes: number;
  uploadedById: string;
  createdAt: string;
}

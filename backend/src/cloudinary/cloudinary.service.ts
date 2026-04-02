import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: any): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'memeories-store',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result && result.secure_url ? result.secure_url : '');
          },
        )
        .end(file.buffer);
    });
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const parts = imageUrl.split('/');
      const lastPart = parts.pop();
      if (!lastPart) return;
      const filename = lastPart.split('.')[0];
      const publicId = `memeories-store/${filename}`;
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }
}

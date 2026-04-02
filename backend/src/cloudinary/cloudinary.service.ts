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
          { folder: 'memeories-store' },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            if (result && result.secure_url) {
              resolve(result.secure_url);
            } else {
              reject(new Error('Upload failed: result or secure_url is undefined'));
            }
          },
        )
        .end(file.buffer);
    });
  }

  async deleteImage(imageUrl: string): Promise<void> {
    const parts = imageUrl.split('/');
    const lastPart = parts.pop();
    if (!lastPart) {
      throw new Error('Invalid image URL: lastPart is undefined');
    }
    const publicId = lastPart.split('.')[0];
    await cloudinary.uploader.destroy(`memeories-store/${publicId}`);
  }
}

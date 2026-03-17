export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

const config: CloudinaryConfig = {
  cloudName: 'ds8icfdlb',
  uploadPreset: 'upload_images',
};

export async function uploadImageToCloudinary(
  base64DataUrl: string,
): Promise<CloudinaryUploadResult> {
  if (!config.cloudName || !config.uploadPreset) {
    throw new Error('Cloudinary config is missing. Please set cloudName and uploadPreset.');
  }

  const form = new FormData();
  form.append('file', base64DataUrl);
  form.append('upload_preset', config.uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    {
      method: 'POST',
      body: form as any,
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudinary upload failed: ${text}`);
  }

  const json = await response.json();

  return {
    url: json.secure_url ?? json.url,
    publicId: json.public_id,
  };
}

export async function uploadDocxToCloudinary(
  fileUri: string,
): Promise<CloudinaryUploadResult> {
  if (!config.cloudName || !config.uploadPreset) {
    throw new Error('Cloudinary config is missing. Please set cloudName and uploadPreset.');
  }

  const form = new FormData();
  form.append(
    'file',
    {
      uri: fileUri,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      name: 'document.docx',
    } as any,
  );
  form.append('upload_preset', config.uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/raw/upload`,
    {
      method: 'POST',
      body: form as any,
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudinary PDF upload failed: ${text}`);
  }

  const json = await response.json();

  return {
    url: json.secure_url ?? json.url,
    publicId: json.public_id,
  };
}

export async function uploadHtmlToCloudinary(
  base64Html: string,
): Promise<CloudinaryUploadResult> {
  if (!config.cloudName || !config.uploadPreset) {
    throw new Error('Cloudinary config is missing. Please set cloudName and uploadPreset.');
  }

  const form = new FormData();
  form.append('file', `data:text/html;base64,${base64Html}`);
  form.append('upload_preset', config.uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/raw/upload`,
    {
      method: 'POST',
      body: form as any,
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudinary HTML upload failed: ${text}`);
  }

  const json = await response.json();

  return {
    url: json.secure_url ?? json.url,
    publicId: json.public_id,
  };
}




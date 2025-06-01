import * as FileSystem from 'expo-file-system';

const BACKGROUND_REMOVAL_API = {
  url: 'http://172.161.105.202:5000/remove_bg',
  apiKey: 'aa525090c8780a52e32fb348c21cd5acf0cb02728181aabbc556f60844f5550c'
};

export const removeBackground = async (imageUri) => {
  try {
    // Create form data for the API request
    const formData = new FormData();
    
    // Get the file info and create a file object
    const filename = imageUri.split('/').pop();
    const fileExtension = filename.split('.').pop();
    const mimeType = `image/${fileExtension.toLowerCase() === 'jpg' ? 'jpeg' : fileExtension.toLowerCase()}`;
    
    formData.append('image', {
      uri: imageUri,
      name: filename,
      type: mimeType,
    });

    console.log('Sending image to background removal service:', {
      url: BACKGROUND_REMOVAL_API.url,
      filename,
      mimeType
    });

    // Make the API request
    const response = await fetch(BACKGROUND_REMOVAL_API.url, {
      method: 'POST',
      headers: {
        'X-API-Key': BACKGROUND_REMOVAL_API.apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Background removal failed: ${response.status} ${response.statusText}`);
    }

    // Get the processed image as array buffer
    const arrayBuffer = await response.arrayBuffer();
    
    // Convert array buffer to base64
    const base64Data = btoa(
      new Uint8Array(arrayBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    // Save the processed image to a temporary location
    const processedImagePath = `${FileSystem.cacheDirectory}processed_${Date.now()}.png`;
    
    await FileSystem.writeAsStringAsync(processedImagePath, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('Background removal successful:', processedImagePath);

    return {
      success: true,
      processedImageUri: processedImagePath,
      error: null
    };

  } catch (error) {
    console.error('Background removal error:', error);
    return {
      success: false,
      processedImageUri: null,
      error: error.message
    };
  }
}; 
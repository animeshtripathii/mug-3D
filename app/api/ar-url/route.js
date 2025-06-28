export async function POST(req) {
  try {
    const data = await req.json();
    const { imageUrl } = data;

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate a unique identifier for this AR session
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);

    // Get the base URL - ensure it's a valid URL format
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      if (process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`;
      } else {
        baseUrl = 'http://localhost:3000';
      }
    }

    // Ensure the baseUrl doesn't have trailing slashes
    baseUrl = baseUrl.replace(/\/+$/, '');

    // Create a shorter image URL by storing it in a session or temporary storage
    // For now, we'll just use the full URL
    const encodedImageUrl = encodeURIComponent(imageUrl);

    // Create the AR URL
    const arUrl = `${baseUrl}/ar/${sessionId}?image=${encodedImageUrl}`;

    // Log for debugging
    console.log('Generated AR URL:', {
      baseUrl,
      sessionId,
      fullUrl: arUrl
    });

    return new Response(
      JSON.stringify({ 
        url: arUrl,
        sessionId,
        debug: {
          baseUrl,
          imageUrlLength: imageUrl.length
        }
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in AR URL generation:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate AR URL',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
} 
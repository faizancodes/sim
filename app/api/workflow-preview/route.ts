import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  // Ensure we're using the correct endpoint if specified
  endpoint: process.env.NEXT_PUBLIC_S3_ENDPOINT || undefined,
})

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const formData = await request.formData()
    const workflowId = formData.get('workflowId') as string
    const lightModeImage = formData.get('lightModeImage') as File
    const darkModeImage = formData.get('darkModeImage') as File

    if (!workflowId || !lightModeImage || !darkModeImage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate a unique ID for this preview
    const previewId = uuidv4()
    const timestamp = Date.now()
    const bucket = process.env.NEXT_PUBLIC_S3_BUCKET
    const format = 'webp'

    // Upload light mode image
    const lightModeKey = `${workflowId}/${previewId}-light.${format}`
    const lightModeBuffer = Buffer.from(await lightModeImage.arrayBuffer())
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: lightModeKey,
        Body: lightModeBuffer,
        ContentType: 'image/webp',
        CacheControl: 'max-age=31536000',
        ACL: 'public-read',
      })
    )

    // Upload dark mode image
    const darkModeKey = `${workflowId}/${previewId}-dark.${format}`
    const darkModeBuffer = Buffer.from(await darkModeImage.arrayBuffer())
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: darkModeKey,
        Body: darkModeBuffer,
        ContentType: 'image/webp',
        CacheControl: 'max-age=31536000',
        ACL: 'public-read',
      })
    )
    const baseUrl = process.env.NEXT_PUBLIC_S3_URL

    const lightModeUrl = `${baseUrl}/${lightModeKey}`
    const darkModeUrl = `${baseUrl}/${darkModeKey}`

    // Return the preview result
    return NextResponse.json({
      previewId,
      lightModeUrl,
      darkModeUrl,
      timestamp,
      workflowId,
    })
  } catch (error) {
    console.error('Error generating workflow preview:', error)
    return NextResponse.json({ error: 'Failed to generate workflow preview' }, { status: 500 })
  }
}

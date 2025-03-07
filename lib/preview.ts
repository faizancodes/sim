'use client'

import html2canvas from 'html2canvas'
import { v4 as uuidv4 } from 'uuid'
import { storageMode } from './storage'

/**
 * Interface for preview generation options
 */
interface PreviewOptions {
  workflowId: string
  width?: number
  height?: number
  quality?: number
  format?: 'png' | 'jpeg' | 'webp'
  s3Bucket?: string
  s3Path?: string
  selector?: string
  padding?: number
  scale?: number
}

/**
 * Interface for the result of preview generation
 */
interface PreviewResult {
  previewId: string
  lightModeUrl: string
  darkModeUrl: string
  timestamp: number
  workflowId: string
}

/**
 * Default options for preview generation
 */
const DEFAULT_OPTIONS: Partial<PreviewOptions> = {
  width: 1200,
  height: 630,
  quality: 80,
  format: 'webp',
  s3Bucket: 'sim-studio-previews',
  s3Path: 'workflow-previews',
  selector: '.react-flow',
  padding: 32,
  scale: 1.5,
}

/**
 * Generates preview screenshots of a workflow in both light and dark modes
 * using completely isolated rendering to prevent any theme flashing
 *
 * @param options - Options for preview generation
 * @returns Promise resolving to the preview result with URLs
 */
export async function generateWorkflowPreview(options: PreviewOptions): Promise<PreviewResult> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
  const { workflowId, quality, format, s3Bucket, s3Path, selector, padding, scale } = mergedOptions

  // Generate a unique ID for this preview
  const previewId = uuidv4()
  const timestamp = Date.now()

  try {
    // Get the ReactFlow container element
    const flowElement = document.querySelector(selector as string) as HTMLElement
    if (!flowElement) {
      throw new Error(`Element with selector "${selector}" not found`)
    }

    // Create offscreen clones for both themes
    const { lightModeBuffer, darkModeBuffer } = await captureElementInBothThemes(
      flowElement,
      padding,
      scale
    )

    // Upload to storage
    const lightModeUrl = await uploadToStorage(
      lightModeBuffer,
      `${s3Path}/${workflowId}/${previewId}-light.${format}`,
      format,
      quality,
      s3Bucket
    )

    const darkModeUrl = await uploadToStorage(
      darkModeBuffer,
      `${s3Path}/${workflowId}/${previewId}-dark.${format}`,
      format,
      quality,
      s3Bucket
    )

    return {
      previewId,
      lightModeUrl,
      darkModeUrl,
      timestamp,
      workflowId,
    }
  } catch (error) {
    console.error('Error generating workflow preview:', error)
    throw new Error(
      `Failed to generate workflow preview: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Captures an element in both light and dark themes using completely isolated rendering
 * to prevent any theme flashing in the main UI
 *
 * @param element - The HTML element to capture
 * @param padding - Padding to add around the element (in pixels)
 * @param scale - Scale factor for the image (higher = better quality)
 * @returns Promise resolving to buffers for both themes
 */
async function captureElementInBothThemes(
  element: HTMLElement,
  padding: number = 32,
  scale: number = 1.5
): Promise<{ lightModeBuffer: Buffer; darkModeBuffer: Buffer }> {
  // Create two separate offscreen containers for light and dark themes
  const lightContainer = createOffscreenContainer(element, 'light')
  const darkContainer = createOffscreenContainer(element, 'dark')

  try {
    // Capture both themes in parallel for efficiency
    const [lightModeBuffer, darkModeBuffer] = await Promise.all([
      captureElementToImage(
        lightContainer.querySelector(':first-child') as HTMLElement,
        padding,
        scale
      ),
      captureElementToImage(
        darkContainer.querySelector(':first-child') as HTMLElement,
        padding,
        scale
      ),
    ])

    return { lightModeBuffer, darkModeBuffer }
  } finally {
    // Clean up - remove the offscreen containers
    if (document.body.contains(lightContainer)) {
      document.body.removeChild(lightContainer)
    }
    if (document.body.contains(darkContainer)) {
      document.body.removeChild(darkContainer)
    }
  }
}

/**
 * Creates an offscreen container with a clone of the element in the specified theme
 *
 * @param element - The element to clone
 * @param theme - The theme to apply ('light' or 'dark')
 * @returns The offscreen container element
 */
function createOffscreenContainer(element: HTMLElement, theme: 'light' | 'dark'): HTMLElement {
  // Create a deep clone of the element
  const clone = element.cloneNode(true) as HTMLElement

  // Create an offscreen container
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '-9999px'
  container.style.width = `${element.offsetWidth}px`
  container.style.height = `${element.offsetHeight}px`
  container.style.overflow = 'hidden'
  container.style.pointerEvents = 'none'

  // Apply theme class directly to the container instead of document root
  if (theme === 'dark') {
    container.classList.add('dark')
  }

  // Apply theme-specific CSS variables to container to ensure proper theme rendering
  const themeVars =
    theme === 'dark'
      ? {
          '--background': 'hsl(240 10% 3.9%)',
          '--foreground': 'hsl(0 0% 98%)',
          '--card': 'hsl(240 10% 3.9%)',
          '--card-foreground': 'hsl(0 0% 98%)',
          '--popover': 'hsl(240 10% 3.9%)',
          '--popover-foreground': 'hsl(0 0% 98%)',
          '--primary': 'hsl(0 0% 98%)',
          '--primary-foreground': 'hsl(240 5.9% 10%)',
          '--secondary': 'hsl(240 3.7% 15.9%)',
          '--secondary-foreground': 'hsl(0 0% 98%)',
          '--muted': 'hsl(240 3.7% 15.9%)',
          '--muted-foreground': 'hsl(240 5% 64.9%)',
          '--accent': 'hsl(240 3.7% 15.9%)',
          '--accent-foreground': 'hsl(0 0% 98%)',
          '--destructive': 'hsl(0 62.8% 30.6%)',
          '--destructive-foreground': 'hsl(0 0% 98%)',
          '--border': 'hsl(240 3.7% 15.9%)',
          '--input': 'hsl(240 3.7% 15.9%)',
          '--ring': 'hsl(240 4.9% 83.9%)',
        }
      : {
          '--background': 'hsl(0 0% 100%)',
          '--foreground': 'hsl(240 10% 3.9%)',
          '--card': 'hsl(0 0% 100%)',
          '--card-foreground': 'hsl(240 10% 3.9%)',
          '--popover': 'hsl(0 0% 100%)',
          '--popover-foreground': 'hsl(240 10% 3.9%)',
          '--primary': 'hsl(240 5.9% 10%)',
          '--primary-foreground': 'hsl(0 0% 98%)',
          '--secondary': 'hsl(240 4.8% 95.9%)',
          '--secondary-foreground': 'hsl(240 5.9% 10%)',
          '--muted': 'hsl(240 4.8% 95.9%)',
          '--muted-foreground': 'hsl(240 3.8% 46.1%)',
          '--accent': 'hsl(240 4.8% 95.9%)',
          '--accent-foreground': 'hsl(240 5.9% 10%)',
          '--destructive': 'hsl(0 84.2% 60.2%)',
          '--destructive-foreground': 'hsl(0 0% 98%)',
          '--border': 'hsl(240 5.9% 90%)',
          '--input': 'hsl(240 5.9% 90%)',
          '--ring': 'hsl(240 5.9% 10%)',
        }

  // Apply theme variables to container
  Object.entries(themeVars).forEach(([key, value]) => {
    container.style.setProperty(key, value)
  })

  // Apply theme to all elements with data-theme attribute
  clone.querySelectorAll('[data-theme]').forEach((el) => {
    ;(el as HTMLElement).dataset.theme = theme
  })

  // Copy computed styles to ensure the clone looks the same
  copyComputedStyles(element, clone)

  // Add the clone to the container
  container.appendChild(clone)

  // Add the container to the document body
  document.body.appendChild(container)

  return container
}

/**
 * Recursively copies computed styles from source to target
 *
 * @param source - Source element
 * @param target - Target element
 */
function copyComputedStyles(source: HTMLElement, target: HTMLElement) {
  const computedStyle = window.getComputedStyle(source)

  // Copy element styles
  for (const prop of Array.from(computedStyle)) {
    target.style.setProperty(prop, computedStyle.getPropertyValue(prop))
  }

  // Recursively copy styles for all children
  if (source.children.length > 0 && target.children.length > 0) {
    for (let i = 0; i < source.children.length; i++) {
      if (i < target.children.length) {
        copyComputedStyles(source.children[i] as HTMLElement, target.children[i] as HTMLElement)
      }
    }
  }
}

/**
 * Captures an HTML element to an image using html2canvas
 *
 * @param element - The HTML element to capture
 * @param padding - Padding to add around the element (in pixels)
 * @param scale - Scale factor for the image (higher = better quality)
 * @returns Promise resolving to the image buffer
 */
async function captureElementToImage(
  element: HTMLElement,
  padding: number = 32,
  scale: number = 1.5
): Promise<Buffer> {
  try {
    // Calculate the bounds of the element
    const rect = element.getBoundingClientRect()

    // Create a canvas with padding
    const canvas = await html2canvas(element, {
      backgroundColor: null, // Transparent background
      scale: scale, // Higher scale for better quality
      logging: false,
      useCORS: true,
      allowTaint: true,
      x: -padding,
      y: -padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    })

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob as Blob)
        },
        'image/webp',
        0.9
      )
    })

    // Convert blob to buffer
    const arrayBuffer = await blob.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    console.error('Error capturing element to image:', error)
    throw error
  }
}

/**
 * Uploads a buffer to storage (S3 or local depending on configuration)
 *
 * @param buffer - Image buffer to upload
 * @param path - Path to store the file
 * @param format - Image format
 * @param quality - Image quality
 * @param bucket - S3 bucket name
 * @returns Promise resolving to the URL of the uploaded file
 */
async function uploadToStorage(
  buffer: Buffer,
  path: string,
  format: string = 'webp',
  quality: number = 80,
  bucket?: string
): Promise<string> {
  // Check if we should use local storage or S3
  if (storageMode.isLocal) {
    // For local storage implementation
    // This would save to a local directory in a real implementation
    console.log(`[Local Storage] Would save ${path} locally`)
    return `file://${path}`
  } else {
    // For S3 implementation
    // In a real implementation, this would use AWS SDK to upload to S3
    // For now, we'll just simulate the upload

    // This would be replaced with actual S3 upload code
    console.log(`[S3] Would upload to ${bucket}/${path}`)

    // Simulate S3 URL
    const baseUrl = process.env.NEXT_PUBLIC_S3_URL || `https://${bucket}.s3.amazonaws.com`
    return `${baseUrl}/${path}`
  }
}

/**
 * Deletes a preview from storage
 *
 * @param previewId - ID of the preview to delete
 * @param workflowId - ID of the workflow
 * @param s3Bucket - S3 bucket name
 * @param s3Path - S3 path prefix
 * @returns Promise resolving when deletion is complete
 */
export async function deleteWorkflowPreview(
  previewId: string,
  workflowId: string,
  s3Bucket: string = DEFAULT_OPTIONS.s3Bucket as string,
  s3Path: string = DEFAULT_OPTIONS.s3Path as string
): Promise<void> {
  try {
    if (storageMode.isLocal) {
      // For local storage implementation
      console.log(`[Local Storage] Would delete preview ${previewId} for workflow ${workflowId}`)
    } else {
      // For S3 implementation
      // This would use AWS SDK to delete from S3
      console.log(
        `[S3] Would delete preview ${previewId} for workflow ${workflowId} from ${s3Bucket}/${s3Path}`
      )
    }
  } catch (error) {
    console.error('Error deleting workflow preview:', error)
    throw new Error(
      `Failed to delete workflow preview: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

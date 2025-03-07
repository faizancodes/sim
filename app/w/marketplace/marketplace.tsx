'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, ChevronLeft, Eye, Search, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

// Types
interface Workflow {
  id: string
  name: string
  description: string
  author: string
  stars: number
  views: number
  tags: string[]
  thumbnail?: string
  workflowUrl?: string
}

// Mock data for workflows
const mockWorkflows: Record<string, Workflow[]> = {
  popular: [
    {
      id: '1',
      name: 'Customer Support Bot',
      description:
        'Automate customer support with this intelligent workflow system for 24/7 service',
      author: 'SimStudio',
      stars: 245,
      views: 1245,
      tags: ['support', 'automation', 'customer service'],
      thumbnail: '/thumbnails/customer-support.png',
    },
    {
      id: '2',
      name: 'Content Generator',
      description: 'Generate blog posts, social media content, and marketing materials with AI',
      author: 'ContentAI',
      stars: 187,
      views: 987,
      tags: ['content', 'generation', 'marketing'],
      thumbnail: '/thumbnails/content-generator.png',
    },
    {
      id: '3',
      name: 'Data Analysis Pipeline',
      description: 'Analyze and visualize complex data sets with this powerful workflow system',
      author: 'DataWizard',
      stars: 156,
      views: 756,
      tags: ['data', 'analysis', 'visualization'],
      thumbnail: '/thumbnails/data-analysis.png',
      workflowUrl: 'http://localhost:3000/w/015c6af0-acf0-464b-99d0-f6e93de94fb9',
    },
    {
      id: '4',
      name: 'Data Analysis Pipeline',
      description: 'Analyze and visualize complex data sets with this powerful workflow system',
      author: 'DataWizard',
      stars: 156,
      views: 756,
      tags: ['data', 'analysis', 'visualization'],
      thumbnail: '/thumbnails/data-analysis.png',
      workflowUrl: 'http://localhost:3000/w/015c6af0-acf0-464b-99d0-f6e93de94fb9',
    },
    {
      id: '5',
      name: 'Data Analysis Pipeline',
      description: 'Analyze and visualize complex data sets with this powerful workflow system',
      author: 'DataWizard',
      stars: 156,
      views: 756,
      tags: ['data', 'analysis', 'visualization'],
      thumbnail: '/thumbnails/data-analysis.png',
      workflowUrl: 'http://localhost:3000/w/015c6af0-acf0-464b-99d0-f6e93de94fb9',
    },
    {
      id: '6',
      name: 'Data Analysis Pipeline',
      description: 'Analyze and visualize complex data sets with this powerful workflow system',
      author: 'DataWizard',
      stars: 156,
      views: 756,
      tags: ['data', 'analysis', 'visualization'],
      thumbnail: '/thumbnails/data-analysis.png',
      workflowUrl: 'http://localhost:3000/w/015c6af0-acf0-464b-99d0-f6e93de94fb9',
    },
  ],
  trending: [
    {
      id: '4',
      name: 'Email Automation',
      description: 'Automate your email campaigns with personalized content and scheduling tools',
      author: 'EmailPro',
      stars: 143,
      views: 543,
      tags: ['email', 'automation', 'marketing'],
      thumbnail: '/thumbnails/email-automation.png',
      workflowUrl: 'http://localhost:3000/w/015c6af0-acf0-464b-99d0-f6e93de94fb9',
    },
    {
      id: '5',
      name: 'Social Media Manager',
      description: 'Schedule and post to multiple social media platforms with analytics tracking',
      author: 'SocialGenius',
      stars: 132,
      views: 432,
      tags: ['social', 'media', 'content'],
      thumbnail: '/thumbnails/social-media.png',
      workflowUrl: 'http://localhost:3000/w/015c6af0-acf0-464b-99d0-f6e93de94fb9',
    },
    {
      id: '6',
      name: 'Marketing Analytics',
      description: 'Track and analyze your marketing campaigns with comprehensive reporting tools',
      author: 'MarketPro',
      stars: 121,
      views: 421,
      tags: ['marketing', 'analytics', 'reporting'],
      thumbnail: '/thumbnails/marketing-analytics.png',
    },
  ],
  marketing: [
    {
      id: '7',
      name: 'SEO Optimizer',
      description: 'Optimize your content for search engines with keyword analysis and suggestions',
      author: 'SEOPro',
      stars: 121,
      views: 321,
      tags: ['seo', 'marketing', 'content'],
      thumbnail: '/thumbnails/seo-optimizer.png',
    },
    {
      id: '8',
      name: 'Ad Campaign Manager',
      description: 'Create and manage ad campaigns across multiple platforms with budget tracking',
      author: 'AdGenius',
      stars: 110,
      views: 210,
      tags: ['ads', 'marketing', 'campaigns'],
      thumbnail: '/thumbnails/ad-campaign.png',
    },
    {
      id: '9',
      name: 'Email Marketing Suite',
      description: 'Complete email marketing solution with templates, analytics, and A/B testing',
      author: 'EmailMaster',
      stars: 95,
      views: 195,
      tags: ['email', 'marketing', 'templates'],
      thumbnail: '/thumbnails/email-marketing.png',
    },
  ],
}

// WorkflowCard component
function WorkflowCard({ workflow, index }: { workflow: Workflow; index: number }) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md flex flex-col h-full">
      <div className="h-40 relative overflow-hidden bg-gradient-to-br from-purple-500 to-blue-600">
        {workflow.thumbnail ? (
          <div
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${workflow.thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
            }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <span className="text-white font-medium text-lg">{workflow.name}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-grow">
        <CardHeader className="p-4 pb-2">
          <h3 className="font-medium text-sm">{workflow.name}</h3>
        </CardHeader>
        <CardContent className="p-4 pt-0 pb-2 flex-grow flex flex-col">
          <p className="text-xs text-muted-foreground line-clamp-2">{workflow.description}</p>
        </CardContent>
        <CardFooter className="p-4 pt-2 mt-auto flex justify-between items-center">
          <div className="text-xs text-muted-foreground">by {workflow.author}</div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Star className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">{workflow.stars}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">{workflow.views}</span>
            </div>
          </div>
        </CardFooter>
      </div>
    </Card>
  )
}

// WorkflowCardSkeleton component
function WorkflowCardSkeleton() {
  return (
    <div className="overflow-hidden">
      <Card className="overflow-hidden transition-all hover:shadow-md flex flex-col h-full">
        <Skeleton className="h-40 w-full" />
        <div className="flex flex-col flex-grow">
          <CardHeader className="p-4 pb-2">
            <Skeleton className="h-5 w-3/4" />
          </CardHeader>
          <CardContent className="p-4 pt-0 pb-2 flex-grow flex flex-col">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
          <CardFooter className="p-4 pt-2 mt-auto flex justify-between items-center">
            <Skeleton className="h-4 w-20" />
            <div className="flex items-center space-x-3">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
          </CardFooter>
        </div>
      </Card>
    </div>
  )
}

// Section component with loading state
function Section({
  title,
  workflows,
  isLoading,
}: {
  title: string
  workflows: Workflow[]
  isLoading: boolean
}) {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? // Show skeletons immediately without animation when loading
            Array.from({ length: 3 }).map((_, index) => (
              <WorkflowCardSkeleton key={`skeleton-${index}`} />
            ))
          : // Animate workflow cards sequentially after data is loaded
            workflows.map((workflow, index) => (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <WorkflowCard workflow={workflow} index={index} />
              </motion.div>
            ))}
      </div>
    </div>
  )
}

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [workflowData, setWorkflowData] = useState<Record<string, Workflow[]>>(mockWorkflows)

  // Fetch workflows on component mount
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setLoading(true)

        // Simulate API call with timeout
        // In a real implementation, this would be a fetch call to your API
        setTimeout(() => {
          // For now, just use the mock data
          setWorkflowData(mockWorkflows)
          setLoading(false)
        }, 1500)

        // Example of how the actual fetch would look:
        // const response = await fetch('/api/workflows/marketplace')
        // if (!response.ok) {
        //   throw new Error(`Error fetching workflows: ${response.statusText}`)
        // }
        // const data = await response.json()
        // setWorkflowData(data)
      } catch (err) {
        console.error('Error fetching workflows:', err)
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        setLoading(false)
      }
    }

    fetchWorkflows()
  }, [])

  return (
    <div className="container mx-auto py-6 px-10 max-w-7xl">
      {/* Back button - animate on page load */}
      <Link
        href="/w/1"
        className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to My Workflows
      </Link>

      {/* Search bar - animate on page load */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search workflows..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          className="mb-8 p-4 border border-red-200 bg-red-50 text-red-700 rounded-md"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </p>
        </motion.div>
      )}

      {/* Sections */}
      <Section title="Popular Workflows" workflows={workflowData.popular} isLoading={loading} />
      <Section title="Trending Now" workflows={workflowData.trending} isLoading={loading} />
      <Section title="Marketing Workflows" workflows={workflowData.marketing} isLoading={loading} />
    </div>
  )
}

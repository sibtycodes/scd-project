'use server'

import { supabaseServer } from '@/lib/supabase/server'
import { getFullIdeaAnalysisAI } from '../ai-actions/newIdeaAnalysisFull'
import { generatePDFBuffer } from './reportPDFgenerator'
export interface ReportRecord {
    id: string
    idea_id: string
    user_id: string
    file_url: string
    generated_at: string
}

export interface ReportCreateInput {
    idea_id: string
    user_id: string
    file_url: string
}

/**
 * Gets an existing report row for an idea id if present.
 * Frontend usage: indirect via getOrCreateReport, triggered from app/(authenticated)/dashboard/results/page.tsx through lib/api.ts.
 */
export async function getReportByIdea(ideaId: string): Promise<ReportRecord | null> {
    const supabase = await supabaseServer()

    const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('idea_id', ideaId)
        .maybeSingle()

    if (error && error.code !== 'PGRST116') {
        throw new Error(error.message)
    }

    return data as ReportRecord | null
}

/**
 * Creates a report database row after a PDF is generated and uploaded.
 * Frontend usage: internal helper for generateReportForIdea.
 */
export async function createReportRecord(input: ReportCreateInput): Promise<ReportRecord> {
    const supabase = await supabaseServer()

    const { data, error } = await supabase
        .from('reports')
        .insert([
            {
                idea_id: input.idea_id,
                user_id: input.user_id,
                file_url: input.file_url,
                generated_at: new Date().toISOString(),
            },
        ])
        .select()
        .single()

    if (error || !data) {
        throw new Error(error?.message || 'Failed to create report record')
    }

    return data as ReportRecord
}

/**
 * Generates PDF report bytes, uploads the file, and stores a report row.
 * Frontend usage: indirect via getOrCreateReport from app/(authenticated)/dashboard/results/page.tsx.
 */
export async function generateReportForIdea(ideaId: string): Promise<ReportRecord> {
    const supabase = await supabaseServer()

    // Get authenticated user
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
        throw new Error('Not authenticated')
    }

    // Verify idea belongs to user
    const { data: idea, error: ideaError } = await supabase
        .from('startup_ideas')
        .select('id, user_id, title')
        .eq('id', ideaId)
        .eq('user_id', user.id)
        .single()

    if (ideaError || !idea) {
        throw new Error('Idea not found or access denied')
    }

    // Get full analysis data using new AI function
    const fullAnalysis = await getFullIdeaAnalysisAI(ideaId)

    // Generate PDF buffer
    const pdfBuffer = await generatePDFBuffer(fullAnalysis)

    // Generate unique filename
    const timestamp = Date.now()
    const safeTitle = (idea.title || 'report')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 50)
    const fileName = `${safeTitle}-${timestamp}.pdf`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('reports')
        .upload(fileName, pdfBuffer, {
            contentType: 'application/pdf',
            upsert: true,
        })

    if (uploadError) {
        throw new Error(`Failed to upload PDF: ${uploadError.message}`)
    }

    // Get public URL
    const {
        data: { publicUrl },
    } = supabase.storage.from('reports').getPublicUrl(fileName)

    // Create report record in database
    const report = await createReportRecord({
        idea_id: ideaId,
        user_id: user.id,
        file_url: publicUrl,
    })

    return report
}

/**
 * Get or create report for an idea (lazy generation)
 * This mirrors the Python get_or_create_report endpoint behavior
 * Frontend usage: app/(authenticated)/dashboard/results/page.tsx via lib/api.ts getOrCreateIdeaReportPDF.
 */
export async function getOrCreateReport(ideaId: string): Promise<ReportRecord> {
    const supabase = await supabaseServer()

    // Get authenticated user
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
        throw new Error('Not authenticated')
    }

    // Check for existing report
    const existingReport = await getReportByIdea(ideaId)

    if (existingReport) {
        // Verify user owns this report
        if (existingReport.user_id !== user.id) {
            throw new Error('Access denied')
        }

        // Optionally verify file still exists (check URL is valid)
        // For now, just return existing report
        return existingReport
    }

    // No existing report, generate a new one
    return generateReportForIdea(ideaId)
}

/**
 * Deletes a report row and attempts to remove its PDF from storage.
 * Frontend usage: no direct page import found (available for cleanup/admin flows).
 */
export async function deleteReport(reportId: string): Promise<void> {
    const supabase = await supabaseServer()

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
        throw new Error('Not authenticated')
    }

    // Get report and verify ownership
    const { data: report, error: reportError } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .eq('user_id', user.id)
        .single()

    if (reportError || !report) {
        throw new Error('Report not found or access denied')
    }

    // Delete from storage if possible
    if (report.file_url) {
        try {
            // Extract path from URL
            const url = new URL(report.file_url)
            const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/reports\/(.+)/)
            if (pathMatch) {
                await supabase.storage.from('reports').remove([pathMatch[1]])
            }
        } catch {
            // Ignore storage deletion errors
        }
    }

    // Delete database record
    const { error: deleteError } = await supabase.from('reports').delete().eq('id', reportId)

    if (deleteError) {
        throw new Error(deleteError.message)
    }
}
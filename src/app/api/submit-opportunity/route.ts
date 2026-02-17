import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'
import { submissionSchema } from '@/types/submission'
import { slugify } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = submissionSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid submission data', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const data = result.data
    const supabase = createAdminClient()

    // Generate funder slug
    const funderSlug = slugify(data.funder_name)

    // Upsert funder (match by slug to avoid duplicates)
    const { data: funder, error: funderError } = await supabase
      .from('funders')
      .upsert(
        {
          slug: funderSlug,
          name: data.funder_name,
          funder_type: data.funder_type,
          website_url: data.website_url || null,
          contact_email: data.contact_email,
          description: data.funder_description || null,
          is_verified: false,
        },
        { onConflict: 'slug' }
      )
      .select('id')
      .single()

    if (funderError || !funder) {
      console.error('Funder upsert error:', funderError)
      return NextResponse.json({ error: 'Failed to save funder information' }, { status: 500 })
    }

    // Generate opportunity slug: {funder-slug}-{title-slug}
    const titleSlug = slugify(data.title).substring(0, 60).replace(/-$/, '')
    const opportunitySlug = `${funderSlug}-${titleSlug}`

    // Convert dollar amounts to cents
    const amountMinCents = data.amount_min ? Math.round(data.amount_min * 100) : null
    const amountMaxCents = data.amount_max ? Math.round(data.amount_max * 100) : null

    // Build amount display
    let amountDisplay: string | null = null
    if (amountMinCents && amountMaxCents) {
      amountDisplay = `$${data.amount_min!.toLocaleString()} - $${data.amount_max!.toLocaleString()}`
    } else if (amountMaxCents) {
      amountDisplay = `Up to $${data.amount_max!.toLocaleString()}`
    } else if (amountMinCents) {
      amountDisplay = `From $${data.amount_min!.toLocaleString()}`
    }

    // Insert opportunity
    const { data: opportunity, error: oppError } = await supabase
      .from('opportunities')
      .insert({
        slug: opportunitySlug,
        title: data.title,
        summary: data.summary,
        description: data.description || null,
        opportunity_type: data.opportunity_type,
        status: 'open',
        amount_min: amountMinCents,
        amount_max: amountMaxCents,
        amount_display: amountDisplay,
        deadline_type: data.deadline_type,
        deadline_date: data.deadline_date || null,
        deadline_display: data.deadline_date
          ? new Date(data.deadline_date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })
          : null,
        application_url: data.application_url || null,
        eligibility_summary: data.eligibility_summary || null,
        eligible_org_types: data.eligible_org_types?.length ? data.eligible_org_types : null,
        eligible_geography: data.eligible_geography?.length ? data.eligible_geography : null,
        eligible_populations: data.eligible_populations?.length ? data.eligible_populations : null,
        geo_scope_display: data.geo_scope_display || null,
        funder_id: funder.id,
        is_verified: false,
        is_featured: false,
        source_url: data.application_url || data.website_url || null,
      })
      .select('id')
      .single()

    if (oppError || !opportunity) {
      console.error('Opportunity insert error:', oppError)
      return NextResponse.json({ error: 'Failed to save opportunity' }, { status: 500 })
    }

    // Link focus areas if provided
    if (data.focus_areas && data.focus_areas.length > 0) {
      // Look up focus area IDs by slug
      const { data: focusAreaRecords } = await supabase
        .from('focus_areas')
        .select('id, slug')
        .in('slug', data.focus_areas)

      if (focusAreaRecords && focusAreaRecords.length > 0) {
        const links = focusAreaRecords.map((fa) => ({
          opportunity_id: opportunity.id,
          focus_area_id: fa.id,
        }))
        await supabase.from('opportunity_focus_areas').insert(links)
      }
    }

    // Send admin notification email
    const apiKey = process.env.RESEND_API_KEY
    if (apiKey) {
      try {
        const resend = new Resend(apiKey)
        const adminSecret = process.env.ADMIN_SECRET || 'admin'
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://grantlink.org'
        const reviewUrl = `${siteUrl}/admin/review?token=${adminSecret}`

        await resend.emails.send({
          from: 'GrantLink <hello@grantlink.org>',
          to: ['grantlinkfeedback@gmail.com'],
          subject: `New Submission: ${data.title} from ${data.funder_name}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
              <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 16px;">New Opportunity Submission</h2>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; font-size: 14px;"><strong>Organization:</strong> ${data.funder_name}</p>
                <p style="margin: 0 0 8px; font-size: 14px;"><strong>Opportunity:</strong> ${data.title}</p>
                <p style="margin: 0 0 8px; font-size: 14px;"><strong>Type:</strong> ${data.opportunity_type}</p>
                <p style="margin: 0 0 8px; font-size: 14px;"><strong>Contact:</strong> ${data.contact_email}</p>
                ${amountDisplay ? `<p style="margin: 0 0 8px; font-size: 14px;"><strong>Amount:</strong> ${amountDisplay}</p>` : ''}
                ${data.deadline_date ? `<p style="margin: 0; font-size: 14px;"><strong>Deadline:</strong> ${data.deadline_date}</p>` : ''}
              </div>

              <p style="margin-bottom: 8px; font-size: 14px;"><strong>Summary:</strong></p>
              <p style="color: #4a4a4a; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">${data.summary}</p>

              <a href="${reviewUrl}" style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Review Submission
              </a>
            </div>
          `,
        })
      } catch (emailErr) {
        // Don't fail the submission if email fails
        console.error('Failed to send admin notification:', emailErr)
      }
    }

    return NextResponse.json({ success: true, id: opportunity.id })
  } catch (err) {
    console.error('Submit opportunity error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

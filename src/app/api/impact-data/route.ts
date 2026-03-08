import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: list datasets or fetch a single dataset with its columns + rows
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const datasetId = searchParams.get('id')
    const listOnly = searchParams.get('list')

    // List all datasets (summary only)
    if (listOnly === 'true') {
      const { data, error } = await supabase
        .from('impact_datasets')
        .select('id, name, source_type, original_filename, row_count, column_count, detected_issue_area, status, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('List datasets error:', error)
        return NextResponse.json({ error: 'Failed to list datasets' }, { status: 500 })
      }

      return NextResponse.json({ datasets: data ?? [] })
    }

    // Fetch single dataset with columns and rows
    if (datasetId) {
      const [datasetRes, columnsRes, rowsRes] = await Promise.all([
        supabase
          .from('impact_datasets')
          .select('*')
          .eq('id', datasetId)
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('impact_column_mappings')
          .select('*')
          .eq('dataset_id', datasetId)
          .order('column_index'),
        supabase
          .from('impact_data_rows')
          .select('*')
          .eq('dataset_id', datasetId)
          .order('row_index'),
      ])

      if (datasetRes.error) {
        console.error('Fetch dataset error:', datasetRes.error)
        return NextResponse.json({ error: 'Dataset not found' }, { status: 404 })
      }

      return NextResponse.json({
        dataset: datasetRes.data,
        columns: columnsRes.data ?? [],
        rows: rowsRes.data ?? [],
      })
    }

    return NextResponse.json({ error: 'Provide ?list=true or ?id=<uuid>' }, { status: 400 })
  } catch (err) {
    console.error('Impact data API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: create a new dataset or append rows to existing
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'create') {
      const { name, sourceType, originalFilename, columnMappings, dataRows, detectedIssueArea, metadata } = body

      // 1. Insert dataset
      const { data: dataset, error: datasetError } = await supabase
        .from('impact_datasets')
        .insert({
          user_id: user.id,
          name,
          source_type: sourceType,
          original_filename: originalFilename ?? null,
          row_count: dataRows.length,
          column_count: columnMappings.length,
          detected_issue_area: detectedIssueArea ?? null,
          status: 'complete',
          metadata: metadata ?? {},
        })
        .select('id')
        .single()

      if (datasetError || !dataset) {
        console.error('Create dataset error:', datasetError)
        return NextResponse.json({ error: 'Failed to create dataset' }, { status: 500 })
      }

      // 2. Insert column mappings
      const columnInserts = columnMappings.map((col: Record<string, unknown>, i: number) => ({
        dataset_id: dataset.id,
        column_index: i,
        original_header: col.originalHeader,
        detected_type: col.detectedType,
        mapped_metric_id: col.mappedMetricId ?? null,
        display_name: col.displayName,
        unit: col.unit ?? null,
        confidence: col.confidence ?? 0,
        is_included: col.isIncluded ?? true,
      }))

      const { error: colError } = await supabase
        .from('impact_column_mappings')
        .insert(columnInserts)

      if (colError) {
        console.error('Insert columns error:', colError)
        // Clean up dataset
        await supabase.from('impact_datasets').delete().eq('id', dataset.id)
        return NextResponse.json({ error: 'Failed to save column mappings' }, { status: 500 })
      }

      // 3. Insert data rows in chunks of 500
      const CHUNK_SIZE = 500
      for (let i = 0; i < dataRows.length; i += CHUNK_SIZE) {
        const chunk = dataRows.slice(i, i + CHUNK_SIZE).map((row: Record<string, unknown>, idx: number) => ({
          dataset_id: dataset.id,
          row_index: i + idx,
          values: row,
        }))

        const { error: rowError } = await supabase
          .from('impact_data_rows')
          .insert(chunk)

        if (rowError) {
          console.error('Insert rows error:', rowError)
          return NextResponse.json({ error: `Failed to save rows (chunk at ${i})` }, { status: 500 })
        }
      }

      return NextResponse.json({ success: true, datasetId: dataset.id })
    }

    if (action === 'append') {
      const { datasetId, dataRows } = body

      // Verify ownership
      const { data: dataset, error: verifyError } = await supabase
        .from('impact_datasets')
        .select('id, row_count')
        .eq('id', datasetId)
        .eq('user_id', user.id)
        .single()

      if (verifyError || !dataset) {
        return NextResponse.json({ error: 'Dataset not found' }, { status: 404 })
      }

      // Insert new rows starting after existing row_count
      const startIndex = dataset.row_count
      const CHUNK_SIZE = 500
      for (let i = 0; i < dataRows.length; i += CHUNK_SIZE) {
        const chunk = dataRows.slice(i, i + CHUNK_SIZE).map((row: Record<string, unknown>, idx: number) => ({
          dataset_id: datasetId,
          row_index: startIndex + i + idx,
          values: row,
        }))

        const { error: rowError } = await supabase
          .from('impact_data_rows')
          .insert(chunk)

        if (rowError) {
          console.error('Append rows error:', rowError)
          return NextResponse.json({ error: 'Failed to append rows' }, { status: 500 })
        }
      }

      // Update row count
      const { error: updateError } = await supabase
        .from('impact_datasets')
        .update({
          row_count: startIndex + dataRows.length,
          updated_at: new Date().toISOString(),
        })
        .eq('id', datasetId)

      if (updateError) {
        console.error('Update row count error:', updateError)
      }

      return NextResponse.json({ success: true, newRowCount: startIndex + dataRows.length })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('Impact data API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: remove a dataset and all its data
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const datasetId = searchParams.get('id')

    if (!datasetId) {
      return NextResponse.json({ error: 'Dataset ID required' }, { status: 400 })
    }

    // CASCADE will handle column_mappings and data_rows
    const { error } = await supabase
      .from('impact_datasets')
      .delete()
      .eq('id', datasetId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Delete dataset error:', error)
      return NextResponse.json({ error: 'Failed to delete dataset' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Impact data API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

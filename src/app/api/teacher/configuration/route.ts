import { NextRequest, NextResponse } from 'next/server';
import { ConfigurationTable, Configuration } from '@/schema/configuration';
import { requireApiAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiAuth(request);
    if (auth instanceof NextResponse) return auth;

    const table = new ConfigurationTable();
    const rows = await table.readAllAsync();
    return NextResponse.json({ configurations: rows });
  } catch (error) {
    console.error('Error fetching configurations:', error);
    return NextResponse.json({ error: 'Failed to fetch configurations' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireApiAuth(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { id, key, value, type } = body;
    console.log('PUT config:', { key, value, type });
    if ((!key && !id) || value == null) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Auto-detect type if not explicitly provided
    let resolvedType = type;
    if (!resolvedType) {
      const v = String(value).trim();
      if (/^(true|false)$/i.test(v)) {
        resolvedType = 'boolean';
      } else if (!Number.isNaN(Number(v)) && v !== '') {
        resolvedType = 'number';
      } else {
        resolvedType = 'string';
      }
    }

    const table = new ConfigurationTable();

    // If an id is provided prefer id-based upsert/update
    if (id) {
      const existing = await table.readAllAsync();
      const found = existing.find((r) => (r as Configuration).id === id) as Configuration | undefined;
      if (!found) {
        return NextResponse.json({ error: 'Configuration id not found' }, { status: 404 });
      }
      const updated: Configuration = { ...found, value: String(value), type: resolvedType || found.type };
      console.log('Updating by id to:', updated);
      await table.upsertOneAsync(updated);
      console.log('Update successful (by id)');
      return NextResponse.json({ success: true, configuration: updated });
    }

    // Fall back to key-based update
    console.log('Reading existing configs...');
    const existing = await table.readAllAsync();
    console.log('Existing configs:', existing);
    const found = existing.find((r) => r.key === key);
    console.log('Found config:', found);

    if (!found) {
      return NextResponse.json({ error: 'Configuration key not found' }, { status: 404 });
    }

    const updated = { ...found, value: String(value), type: resolvedType || found.type };
    console.log('Updating to:', updated);
    await table.updateByKeyAsync(key, String(value), resolvedType || found.type);
    console.log('Update successful (by key)');
    return NextResponse.json({ success: true, configuration: updated });
  } catch (error) {
    console.error('Error updating configuration:', error);
    return NextResponse.json({ error: 'Failed to update configuration' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { setSecret, listSecrets } from '@/lib/secrets';

/**
 * GET /api/secrets
 * List all secrets (names only, never values)
 */
export async function GET() {
  try {
    const secrets = await listSecrets();
    return NextResponse.json(secrets);
  } catch (error) {
    console.error('Error listing secrets:', error);
    return NextResponse.json(
      { error: 'Failed to list secrets' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/secrets
 * Create or update a secret
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, value } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!value || typeof value !== 'string') {
      return NextResponse.json(
        { error: 'Value is required' },
        { status: 400 }
      );
    }

    // Validate secret name format (alphanumeric, underscores, hyphens)
    const namePattern = /^[A-Za-z][A-Za-z0-9_-]*$/;
    if (!namePattern.test(name)) {
      return NextResponse.json(
        { error: 'Secret name must start with a letter and contain only letters, numbers, underscores, and hyphens' },
        { status: 400 }
      );
    }

    await setSecret(name.trim(), value);

    return NextResponse.json(
      { message: 'Secret saved successfully', name: name.trim() },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving secret:', error);
    
    // Check for missing encryption key
    if (error instanceof Error && error.message.includes('ENCRYPTION_KEY')) {
      return NextResponse.json(
        { error: 'Encryption key not configured. Set ENCRYPTION_KEY environment variable.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to save secret' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * DELETE /api/secrets/:id
 * Delete a secret by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify secret exists
    const secret = await prisma.secret.findUnique({
      where: { id },
    });

    if (!secret) {
      return NextResponse.json(
        { error: 'Secret not found' },
        { status: 404 }
      );
    }

    // Delete the secret
    await prisma.secret.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Secret deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting secret:', error);
    return NextResponse.json(
      { error: 'Failed to delete secret' },
      { status: 500 }
    );
  }
}

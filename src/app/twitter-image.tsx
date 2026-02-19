import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';

export const alt = 'NexTep Edu - Your Bridge to Global Education';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
    const logoData = await readFile(join(process.cwd(), 'public/assets/logo.png'));
    const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`;

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0B1120 0%, #1a2744 40%, #0d4f6e 70%, #0B1120 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background decorative elements */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-100px',
                        right: '-100px',
                        width: '400px',
                        height: '400px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                        display: 'flex',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-80px',
                        left: '-80px',
                        width: '350px',
                        height: '350px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%)',
                        display: 'flex',
                    }}
                />

                {/* Main content */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '24px',
                        zIndex: 1,
                    }}
                >
                    {/* Brand Logo */}
                    <img
                        src={logoSrc}
                        alt="NexTep Edu Logo"
                        width="150"
                        height="150"
                        style={{
                            objectFit: 'contain',
                        }}
                    />

                    {/* Brand name */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '72px',
                                fontWeight: 700,
                                color: '#FFFFFF',
                                letterSpacing: '-1px',
                                display: 'flex',
                            }}
                        >
                            NexTep Edu
                        </div>
                        <div
                            style={{
                                width: '120px',
                                height: '4px',
                                background: 'linear-gradient(90deg, #3B82F6, #0EA5E9)',
                                borderRadius: '2px',
                                display: 'flex',
                            }}
                        />
                    </div>

                    {/* Tagline */}
                    <div
                        style={{
                            fontSize: '28px',
                            fontWeight: 500,
                            color: '#94A3B8',
                            letterSpacing: '2px',
                            textTransform: 'uppercase' as const,
                            display: 'flex',
                        }}
                    >
                        Your Bridge to Global Education
                    </div>

                    {/* Description */}
                    <div
                        style={{
                            fontSize: '20px',
                            color: '#64748B',
                            maxWidth: '700px',
                            textAlign: 'center' as const,
                            lineHeight: 1.5,
                            display: 'flex',
                        }}
                    >
                        Expert guidance for Bangladeshi students to study abroad
                    </div>
                </div>

                {/* Bottom bar */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '0',
                        right: '0',
                        height: '6px',
                        background: 'linear-gradient(90deg, #3B82F6, #0EA5E9, #06B6D4)',
                        display: 'flex',
                    }}
                />

                {/* Website URL */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '24px',
                        right: '40px',
                        fontSize: '16px',
                        color: '#475569',
                        display: 'flex',
                    }}
                >
                    www.nextepedu.com
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
